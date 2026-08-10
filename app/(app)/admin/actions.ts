'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireRole } from '@/lib/auth/roles'
import { createAdminClient } from '@/lib/supabase/admin'

export type BrokerAccountState = {
  error?: string
  success?: string
}

const brokerSchema = z
  .object({
    brokerName: z.string().trim().min(2, 'Informe o nome do corretor.'),
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

  const organizationId = access.assignment.organization_id
  if (!organizationId) {
    return { error: 'Sua conta não está vinculada a uma imobiliária. Contate o suporte.' }
  }

  const parsed = brokerSchema.safeParse({
    brokerName: formData.get('brokerName'),
    email: formData.get('email'),
    temporaryPassword: formData.get('temporaryPassword'),
    confirmPassword: formData.get('confirmPassword'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Revise os dados informados.' }
  }

  const admin = createAdminClient()

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

  const { error: profileError } = await admin
    .from('profiles')
    .update({
      name: parsed.data.brokerName,
      email: parsed.data.email,
      role: 'corretor',
    })
    .eq('id', userId)

  const { error: roleError } = await admin.from('user_roles').insert({
    user_id: userId,
    role: 'corretor',
    organization_id: organizationId,
    created_by: access.userId,
  })

  if (profileError || roleError) {
    // Desfaz a criação do usuário se não foi possível vincular o papel.
    await admin.auth.admin.deleteUser(userId)
    return { error: 'Não foi possível concluir a criação da conta.' }
  }

  revalidatePath('/admin')
  return {
    success: `Corretor cadastrado com sucesso. Entregue o e-mail e a senha temporária a ${parsed.data.brokerName}.`,
  }
}
