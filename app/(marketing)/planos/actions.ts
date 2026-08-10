'use server'

import { headers } from 'next/headers'

import { stripe } from '@/lib/stripe'
import { getPlan } from '@/lib/plans'

/**
 * Inicia uma sessão de checkout de ASSINATURA (recorrente mensal) para um plano.
 * O preço é sempre resolvido no servidor a partir de lib/plans.ts (fonte de
 * verdade), impedindo qualquer manipulação de valor pelo cliente.
 */
export async function startSubscriptionCheckout(planId: string) {
  const plan = getPlan(planId)

  if (!plan) {
    throw new Error(`Plano "${planId}" não encontrado.`)
  }

  if (plan.contactOnly) {
    throw new Error(`O plano "${plan.name}" é fechado via contato comercial.`)
  }

  const headerList = await headers()
  const host = headerList.get('x-forwarded-host') ?? headerList.get('host')
  const protocol = headerList.get('x-forwarded-proto') ?? 'https'
  const origin = host ? `${protocol}://${host}` : ''

  const session = await stripe.checkout.sessions.create({
    // `embedded_page` substituiu `embedded` na API 2026-03-25.dahlia (stripe v21+).
    ui_mode: 'embedded_page',
    return_url: `${origin}/assinar/sucesso?session_id={CHECKOUT_SESSION_ID}`,
    mode: 'subscription',
    // Coletamos o e-mail para depois vincular a assinatura a uma organization do app.
    billing_address_collection: 'auto',
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
      metadata: { plan_id: plan.id },
    },
    metadata: { plan_id: plan.id },
  })

  return session.client_secret
}

export interface CheckoutResult {
  status: string | null
  customerEmail: string | null
  planId: string | null
}

/**
 * Recupera o resultado de uma sessão de checkout concluída para a tela de sucesso.
 */
export async function getCheckoutResult(
  sessionId: string,
): Promise<CheckoutResult> {
  const session = await stripe.checkout.sessions.retrieve(sessionId)

  return {
    status: session.status,
    customerEmail: session.customer_details?.email ?? null,
    planId: (session.metadata?.plan_id as string | undefined) ?? null,
  }
}
