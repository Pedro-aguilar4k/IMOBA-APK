'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requirePlatformAdmin } from '@/lib/auth/tenant'
import { createAdminClient } from '@/lib/supabase/admin'
import { digitsOnly } from '@/lib/security/identifiers'
import { isValidDomain, normalizeDomain, slugify, validateSlug } from '@/lib/sites/slug'

export type BrokerAccountState = {
  error?: string
  success?: string
}

const brokerSchema = z
  .object({
    organizationName: z.string().trim().min(2, 'Informe o nome da imobiliária.'),
    brokerName: z.string().trim().min(2, 'Informe o nome do responsável.'),
    slug: z.string().trim().optional(),
    cnpj: z.string().min(1, 'Informe o CNPJ.'),
    email: z.string().trim().toLowerCase().email('Informe um e-mail válido.'),
    temporaryPassword: z
      .string()
      .min(8, 'A senha temporária deve ter pelo menos 8 caracteres.')
      .regex(/[a-z]/, 'Inclua uma letra minúscula na senha.')
      .regex(/[A-Z]/, 'Inclua uma letra maiúscula na senha.')
      .regex(/[0-9]/, 'Inclua um número na senha.'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.temporaryPassword === data.confirmPassword, {
    message: 'As senhas temporárias não coincidem.',
    path: ['confirmPassword'],
  })

export async function createBrokerAccount(
  _previousState: BrokerAccountState,
  formData: FormData,
): Promise<BrokerAccountState> {
  const access = await requirePlatformAdmin()
  const parsed = brokerSchema.safeParse({
    organizationName: formData.get('organizationName'),
    brokerName: formData.get('brokerName'),
    slug: formData.get('slug'),
    cnpj: formData.get('cnpj'),
    email: formData.get('email'),
    temporaryPassword: formData.get('temporaryPassword'),
    confirmPassword: formData.get('confirmPassword'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Revise os dados informados.' }
  }

  const cnpj = digitsOnly(parsed.data.cnpj)
  if (cnpj.length !== 14) return { error: 'Informe um CNPJ com 14 dígitos.' }

  const admin = createAdminClient()
  const { data: existingOrganization } = await admin
    .from('organizations')
    .select('id')
    .eq('cnpj', cnpj)
    .maybeSingle()

  if (existingOrganization) {
    return { error: 'Já existe uma imobiliária cadastrada com este CNPJ.' }
  }

  // Endereço do site: usa o slug informado ou deriva do nome; garante unicidade.
  const baseSlug = parsed.data.slug?.trim() ? parsed.data.slug : parsed.data.organizationName
  const validation = validateSlug(baseSlug)
  if (!validation.ok) return { error: validation.error }

  let slug = validation.slug
  const { data: slugTaken } = await admin.from('organizations').select('id').eq('slug', slug).maybeSingle()
  if (slugTaken) {
    // acrescenta sufixo numérico até achar um livre
    for (let n = 2; n < 100; n++) {
      const candidate = `${validation.slug}-${n}`
      const { data: taken } = await admin.from('organizations').select('id').eq('slug', candidate).maybeSingle()
      if (!taken) {
        slug = candidate
        break
      }
    }
  }

  const { data: existingUsers, error: listError } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  })
  if (listError) return { error: 'Não foi possível verificar o e-mail informado.' }
  if (existingUsers.users.some((user) => user.email?.toLowerCase() === parsed.data.email)) {
    return { error: 'Já existe uma conta cadastrada com este e-mail.' }
  }

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.temporaryPassword,
    email_confirm: true,
    user_metadata: { name: parsed.data.brokerName },
    app_metadata: { must_change_password: true },
  })

  if (createError || !created.user) {
    return { error: 'Não foi possível criar a conta. Verifique o e-mail e a senha informados.' }
  }

  const userId = created.user.id
  let organizationId: string | null = null

  const rollback = async () => {
    await admin.auth.admin.deleteUser(userId)
    if (organizationId) await admin.from('organizations').delete().eq('id', organizationId)
  }

  const { data: organization, error: organizationError } = await admin
    .from('organizations')
    .insert({
      name: parsed.data.organizationName,
      cnpj,
      slug,
      created_by: access.userId,
    })
    .select('id')
    .single()

  if (organizationError || !organization) {
    await rollback()
    return { error: 'Não foi possível cadastrar a imobiliária.' }
  }
  organizationId = organization.id

  // Cria as configurações padrão do site da corretora.
  await admin.from('org_site_settings').insert({
    organization_id: organizationId,
    hero_title: 'Encontre seu próximo imóvel',
    hero_subtitle: `Imóveis selecionados pela ${parsed.data.organizationName}`,
  })

  const { error: profileError } = await admin
    .from('profiles')
    .update({
      name: parsed.data.brokerName,
      email: parsed.data.email,
      role: 'org_admin',
      organization_id: organizationId,
    })
    .eq('id', userId)

  // O responsável criado pelo admin é o dono da imobiliária (org_admin).
  const { error: roleError } = await admin.from('user_roles').insert({
    user_id: userId,
    role: 'org_admin',
    organization_id: organizationId,
    invited_by: access.userId,
  })

  if (profileError || roleError) {
    await rollback()
    return { error: 'Não foi possível concluir a criação da conta.' }
  }

  revalidatePath('/admin')
  return {
    success: `Conta criada para ${parsed.data.email} no endereço ${slug}. Entregue o e-mail e a senha temporária ao corretor.`,
  }
}

// ===== Slug / domínio / config do app =====

export type DomainState = { error?: string; success?: string }

/** Admin altera o endereço (slug) da corretora. */
export async function updateOrgSlug(_prev: DomainState, formData: FormData): Promise<DomainState> {
  await requirePlatformAdmin()
  const organizationId = String(formData.get('organizationId') ?? '')
  const validation = validateSlug(String(formData.get('slug') ?? ''))
  if (!organizationId) return { error: 'Imobiliária inválida.' }
  if (!validation.ok) return { error: validation.error }

  const admin = createAdminClient()
  const { data: taken } = await admin
    .from('organizations')
    .select('id')
    .eq('slug', validation.slug)
    .neq('id', organizationId)
    .maybeSingle()
  if (taken) return { error: 'Este endereço já está em uso por outra imobiliária.' }

  const { error } = await admin.from('organizations').update({ slug: validation.slug }).eq('id', organizationId)
  if (error) return { error: 'Não foi possível atualizar o endereço.' }

  revalidatePath('/admin')
  return { success: `Endereço atualizado para ${validation.slug}.` }
}

/** Admin define/limpa o domínio próprio da corretora. */
export async function updateOrgDomain(_prev: DomainState, formData: FormData): Promise<DomainState> {
  await requirePlatformAdmin()
  const organizationId = String(formData.get('organizationId') ?? '')
  if (!organizationId) return { error: 'Imobiliária inválida.' }

  const raw = String(formData.get('customDomain') ?? '').trim()
  const admin = createAdminClient()

  // vazio => remover domínio próprio
  if (!raw) {
    const { error } = await admin
      .from('organizations')
      .update({ custom_domain: null, custom_domain_verified: false })
      .eq('id', organizationId)
    if (error) return { error: 'Não foi possível remover o domínio.' }
    revalidatePath('/admin')
    return { success: 'Domínio próprio removido.' }
  }

  const domain = normalizeDomain(raw)
  if (!isValidDomain(domain)) return { error: 'Informe um domínio válido (ex.: corretora.com.br).' }

  const { data: taken } = await admin
    .from('organizations')
    .select('id')
    .eq('custom_domain', domain)
    .neq('id', organizationId)
    .maybeSingle()
  if (taken) return { error: 'Este domínio já está associado a outra imobiliária.' }

  const { error } = await admin
    .from('organizations')
    .update({ custom_domain: domain, custom_domain_verified: false })
    .eq('id', organizationId)
  if (error) return { error: 'Não foi possível salvar o domínio.' }

  revalidatePath('/admin')
  return {
    success: `Domínio ${domain} salvo. Aponte o DNS para a Vercel e adicione o domínio ao projeto para ativá-lo.`,
  }
}
