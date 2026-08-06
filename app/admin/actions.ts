'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireRole } from '@/lib/auth/roles'
import { createAdminClient } from '@/lib/supabase/admin'
import { digitsOnly } from '@/lib/security/identifiers'

export type BrokerAccountState = {
  error?: string
  success?: string
}

const brokerSchema = z
  .object({
    organizationName: z.string().trim().min(2, 'Informe o nome da imobiliária.'),
    brokerName: z.string().trim().min(2, 'Informe o nome do responsável.'),
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
  const access = await requireRole('admin')
  const parsed = brokerSchema.safeParse({
    organizationName: formData.get('organizationName'),
    brokerName: formData.get('brokerName'),
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
      created_by: access.userId,
    })
    .select('id')
    .single()

  if (organizationError || !organization) {
    await rollback()
    return { error: 'Não foi possível cadastrar a imobiliária.' }
  }
  organizationId = organization.id

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
    success: `Conta criada para ${parsed.data.email}. Entregue o e-mail e a senha temporária ao corretor.`,
  }
}
