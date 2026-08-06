'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireOrgRole, logAudit } from '@/lib/auth/tenant'
import { createAdminClient } from '@/lib/supabase/admin'

export type TeamMemberState = {
  error?: string
  success?: string
}

const memberSchema = z
  .object({
    name: z.string().trim().min(2, 'Informe o nome do corretor.'),
    email: z.string().trim().toLowerCase().email('Informe um e-mail válido.'),
    temporaryPassword: z
      .string()
      .min(8, 'A senha temporária deve ter pelo menos 8 caracteres.')
      .regex(/[a-z]/, 'Inclua uma letra minúscula na senha.')
      .regex(/[A-Z]/, 'Inclua uma letra maiúscula na senha.')
      .regex(/[0-9]/, 'Inclua um número na senha.'),
  })

export async function createTeamMember(
  _previousState: TeamMemberState,
  formData: FormData,
): Promise<TeamMemberState> {
  // Apenas o dono da imobiliária gerencia a equipe.
  const ctx = await requireOrgRole('org_admin')
  const organizationId = ctx.organizationId

  const parsed = memberSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    temporaryPassword: formData.get('temporaryPassword'),
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
    user_metadata: { name: parsed.data.name },
    app_metadata: { must_change_password: true },
  })

  if (createError || !created.user) {
    return { error: 'Não foi possível criar a conta. Verifique o e-mail e a senha informados.' }
  }

  const userId = created.user.id

  const { error: profileError } = await admin
    .from('profiles')
    .update({ name: parsed.data.name, email: parsed.data.email, role: 'corretor', organization_id: organizationId })
    .eq('id', userId)

  const { error: roleError } = await admin.from('user_roles').insert({
    user_id: userId,
    role: 'corretor',
    organization_id: organizationId,
    invited_by: ctx.userId,
  })

  if (profileError || roleError) {
    await admin.auth.admin.deleteUser(userId)
    return { error: 'Não foi possível concluir a criação do corretor.' }
  }

  await logAudit({
    actorUserId: ctx.userId,
    organizationId,
    impersonated: Boolean(ctx.impersonation),
    action: 'team.member_created',
    entity: 'user',
    entityId: userId,
    metadata: { email: parsed.data.email, role: 'corretor' },
  })

  revalidatePath('/dashboard/corretor/team')
  return { success: `Corretor criado para ${parsed.data.email}. Entregue o e-mail e a senha temporária.` }
}

export async function removeTeamMember(userId: string): Promise<TeamMemberState> {
  const ctx = await requireOrgRole('org_admin')
  const organizationId = ctx.organizationId

  if (userId === ctx.userId) return { error: 'Você não pode remover a si mesmo.' }

  const admin = createAdminClient()
  // Garante que o alvo pertence à mesma organização e é corretor (não remove outro dono).
  const { data: target } = await admin
    .from('user_roles')
    .select('user_id, role')
    .eq('user_id', userId)
    .eq('organization_id', organizationId)
    .maybeSingle()

  if (!target || target.role !== 'corretor') {
    return { error: 'Corretor não encontrado nesta imobiliária.' }
  }

  const { error } = await admin
    .from('user_roles')
    .delete()
    .eq('user_id', userId)
    .eq('organization_id', organizationId)
    .eq('role', 'corretor')

  if (error) return { error: 'Não foi possível remover o corretor.' }

  await logAudit({
    actorUserId: ctx.userId,
    organizationId,
    impersonated: Boolean(ctx.impersonation),
    action: 'team.member_removed',
    entity: 'user',
    entityId: userId,
  })

  revalidatePath('/dashboard/corretor/team')
  return { success: 'Corretor removido da imobiliária.' }
}
