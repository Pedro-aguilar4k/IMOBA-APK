'use server'

import 'server-only'

import { headers } from 'next/headers'
import { z } from 'zod'

import { stripe } from '@/lib/stripe'
import { getPlan } from '@/lib/plans'
import { createAdminClient } from '@/lib/supabase/admin'

const onboardingSchema = z.object({
  planId: z.string().min(1),
  responsibleName: z.string().trim().min(3, 'Informe o nome do responsável.'),
  companyName: z.string().trim().min(2, 'Informe o nome da imobiliária.'),
  taxId: z
    .string()
    .trim()
    .transform((value) => value.replace(/\D/g, ''))
    .refine((value) => value.length === 11 || value.length === 14, {
      message: 'Informe um CPF (11 dígitos) ou CNPJ (14 dígitos) válido.',
    }),
  phone: z
    .string()
    .trim()
    .transform((value) => value.replace(/\D/g, ''))
    .refine((value) => value.length >= 10 && value.length <= 11, {
      message: 'Informe um telefone válido com DDD.',
    }),
  email: z.string().trim().toLowerCase().email('Informe um e-mail válido.'),
  password: z.string().min(8, 'A senha deve ter no mínimo 8 caracteres.'),
})

export interface OnboardingInput {
  planId: string
  responsibleName: string
  companyName: string
  taxId: string
  phone: string
  email: string
  password: string
}

export type OnboardingResult =
  | { ok: true; clientSecret: string }
  | { ok: false; error: string }

function getOrigin(headerList: Headers) {
  const host = headerList.get('x-forwarded-host') ?? headerList.get('host')
  const protocol = headerList.get('x-forwarded-proto') ?? 'https'
  return host ? `${protocol}://${host}` : ''
}

/**
 * Passo 1 do onboarding: valida a ficha do cliente, cria (ou reaproveita) um
 * usuário PENDENTE de confirmação e abre a sessão de checkout de assinatura.
 * O preço vem sempre de lib/plans.ts (fonte de verdade no servidor).
 */
export async function startOnboarding(
  input: OnboardingInput,
): Promise<OnboardingResult> {
  const parsed = onboardingSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' }
  }

  const data = parsed.data
  const plan = getPlan(data.planId)
  if (!plan) return { ok: false, error: 'Plano não encontrado.' }
  if (plan.contactOnly) {
    return { ok: false, error: 'Este plano é contratado via equipe comercial.' }
  }

  const admin = createAdminClient()

  // Bloqueia se já existe assinatura ativa para o e-mail.
  const { data: activeRows } = await admin
    .from('subscriptions')
    .select('id')
    .eq('contact_email', data.email)
    .in('status', ['active', 'trialing'])
    .limit(1)

  if (activeRows && activeRows.length > 0) {
    return {
      ok: false,
      error: 'Este e-mail já possui uma assinatura ativa. Faça login para continuar.',
    }
  }

  // Reaproveita um cadastro pendente (checkout abandonado) para o mesmo e-mail.
  const { data: pendingRows } = await admin
    .from('subscriptions')
    .select('id, owner_user_id')
    .eq('contact_email', data.email)
    .order('created_at', { ascending: false })
    .limit(1)

  const pending = pendingRows?.[0]
  let ownerUserId = pending?.owner_user_id ?? null

  const userMetadata = { name: data.responsibleName, phone: data.phone }
  const appMetadata = { onboarding_status: 'pending_payment', plan_id: plan.id }

  if (ownerUserId) {
    await admin.auth.admin.updateUserById(ownerUserId, {
      password: data.password,
      user_metadata: userMetadata,
      app_metadata: appMetadata,
    })
  } else {
    const { data: created, error: createError } =
      await admin.auth.admin.createUser({
        email: data.email,
        password: data.password,
        email_confirm: false,
        user_metadata: userMetadata,
        app_metadata: appMetadata,
      })

    if (createError || !created?.user) {
      if (createError && /already|registered|exists/i.test(createError.message)) {
        return {
          ok: false,
          error: 'Este e-mail já está cadastrado. Faça login para continuar.',
        }
      }
      return { ok: false, error: 'Não foi possível iniciar o cadastro. Tente novamente.' }
    }
    ownerUserId = created.user.id
  }

  // Abre a sessão de checkout (assinatura mensal recorrente em BRL).
  const origin = getOrigin(await headers())
  const session = await stripe.checkout.sessions.create({
    ui_mode: 'embedded_page',
    return_url: `${origin}/assinar/sucesso?session_id={CHECKOUT_SESSION_ID}`,
    mode: 'subscription',
    customer_email: data.email,
    line_items: [
      {
        price_data: {
          currency: 'brl',
          product_data: {
            name: `IMOBA ${plan.name}`,
            description: plan.tagline,
          },
          unit_amount: plan.priceInCents,
          recurring: { interval: 'month' },
        },
        quantity: 1,
      },
    ],
    subscription_data: {
      metadata: { plan_id: plan.id, user_id: ownerUserId },
    },
    metadata: { plan_id: plan.id, user_id: ownerUserId },
  })

  if (!session.client_secret) {
    return { ok: false, error: 'Falha ao iniciar o pagamento. Tente novamente.' }
  }

  // Registra/atualiza a assinatura como incompleta até o pagamento confirmar.
  const payload = {
    plan_id: plan.id,
    status: 'incomplete' as const,
    amount_cents: plan.priceInCents,
    currency: 'brl',
    responsible_name: data.responsibleName,
    company_name: data.companyName,
    contact_email: data.email,
    contact_phone: data.phone,
    tax_id: data.taxId,
    owner_user_id: ownerUserId,
    stripe_checkout_session_id: session.id,
    updated_at: new Date().toISOString(),
  }

  if (pending?.id) {
    await admin.from('subscriptions').update(payload).eq('id', pending.id)
  } else {
    await admin.from('subscriptions').insert(payload)
  }

  return { ok: true, clientSecret: session.client_secret }
}

export interface FinalizeResult {
  status: 'complete' | 'pending' | 'error'
  email?: string | null
  planId?: string | null
  companyName?: string | null
  activationToken?: string | null
  alreadyActivated?: boolean
}

/**
 * Passo 2 (tela de sucesso): confirma o pagamento no Stripe e provisiona a
 * conta — cria a organization (imobiliária), o papel admin, a assinatura ativa
 * e um token de confirmação de acesso. Idempotente por sessão de checkout.
 */
export async function finalizeSubscription(
  sessionId: string,
): Promise<FinalizeResult> {
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['subscription', 'customer'],
  })

  if (session.status !== 'complete' || session.payment_status === 'unpaid') {
    return { status: 'pending' }
  }

  const admin = createAdminClient()

  const { data: subRows } = await admin
    .from('subscriptions')
    .select('*')
    .eq('stripe_checkout_session_id', session.id)
    .limit(1)

  const sub = subRows?.[0]
  if (!sub || !sub.owner_user_id) return { status: 'error' }

  // Já finalizado: retorna o estado atual (idempotência).
  if (sub.organization_id && sub.activation_token) {
    return {
      status: 'complete',
      email: sub.contact_email,
      planId: sub.plan_id,
      companyName: sub.company_name,
      activationToken: sub.activation_token,
      alreadyActivated: sub.email_confirmed,
    }
  }

  let organizationId: string | null = sub.organization_id

  if (!organizationId) {
    const { data: org, error: orgError } = await admin
      .from('organizations')
      .insert({
        name: sub.company_name ?? 'Imobiliária',
        cnpj: sub.tax_id ?? null,
        created_by: sub.owner_user_id,
      })
      .select('id')
      .single()

    if (orgError || !org) return { status: 'error' }
    organizationId = org.id

    // Papel admin da imobiliária (remove qualquer papel padrão anterior).
    await admin
      .from('user_roles')
      .delete()
      .eq('user_id', sub.owner_user_id)
      .eq('role', 'locatario')

    await admin.from('user_roles').insert({
      user_id: sub.owner_user_id,
      role: 'admin',
      organization_id: organizationId,
      created_by: sub.owner_user_id,
    })

    await admin
      .from('profiles')
      .update({
        role: 'admin',
        name: sub.responsible_name,
        phone: sub.contact_phone,
        email: sub.contact_email,
      })
      .eq('id', sub.owner_user_id)

    await admin.auth.admin.updateUserById(sub.owner_user_id, {
      app_metadata: {
        onboarding_status: 'active',
        organization_id: organizationId,
        plan_id: sub.plan_id,
      },
    })
  }

  const stripeSub =
    session.subscription && typeof session.subscription !== 'string'
      ? session.subscription
      : null
  const customerId =
    typeof session.customer === 'string'
      ? session.customer
      : (session.customer?.id ?? null)

  const activationToken = crypto.randomUUID()

  await admin
    .from('subscriptions')
    .update({
      organization_id: organizationId,
      status: stripeSub?.status ?? 'active',
      stripe_customer_id: customerId,
      stripe_subscription_id: stripeSub?.id ?? null,
      current_period_end: stripeSub?.current_period_end
        ? new Date(stripeSub.current_period_end * 1000).toISOString()
        : null,
      activation_token: activationToken,
      activation_expires_at: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      email_confirmed: false,
      updated_at: new Date().toISOString(),
    })
    .eq('id', sub.id)

  return {
    status: 'complete',
    email: sub.contact_email,
    planId: sub.plan_id,
    companyName: sub.company_name,
    activationToken,
    alreadyActivated: false,
  }
}
