'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { digitsOnly, hashIdentifier } from '@/lib/security/identifiers'

export type FirstAccessState = {
  error?: string
}

const firstAccessSchema = z.object({
  document: z.string().min(1, 'Informe o CPF.'),
  birthDate: z.string().min(1, 'Informe a data de nascimento.'),
  email: z.string().trim().toLowerCase().email('Informe um e-mail válido.'),
  password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres.'),
})

export async function activateFirstAccess(
  _previousState: FirstAccessState,
  formData: FormData,
): Promise<FirstAccessState> {
  const parsed = firstAccessSchema.safeParse({
    document: formData.get('document'),
    birthDate: formData.get('birthDate'),
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Revise os dados informados.' }
  }

  const document = digitsOnly(parsed.data.document)
  if (document.length !== 11) {
    return { error: 'Não foi possível validar os dados de primeiro acesso.' }
  }

  const admin = createAdminClient()
  const { data: invite, error: inviteError } = await admin
    .from('access_invites')
    .select('id, role, name, organization_id, birth_date, expires_at, status')
    .eq('role', 'locatario')
    .eq('document_hash', hashIdentifier(document))
    .eq('status', 'pending')
    .maybeSingle()

  if (inviteError || !invite || invite.role !== 'locatario') {
    return { error: 'Não foi possível validar os dados de primeiro acesso.' }
  }

  if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
    await admin.from('access_invites').update({ status: 'expired' }).eq('id', invite.id)
    return { error: 'Este acesso expirou. Solicite um novo cadastro ao corretor.' }
  }

  if (invite.birth_date !== parsed.data.birthDate) {
    return { error: 'Não foi possível validar os dados de primeiro acesso.' }
  }

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: { name: invite.name },
  })

  if (createError || !created.user) {
    return { error: 'Não foi possível criar a conta. Verifique o e-mail informado.' }
  }

  const userId = created.user.id
  const { error: profileError } = await admin
    .from('profiles')
    .update({
      name: invite.name,
      email: parsed.data.email,
      role: 'locatario',
      cpf: document,
      birth_date: invite.birth_date,
    })
    .eq('id', userId)

  const { error: roleError } = await admin.from('user_roles').insert({
    user_id: userId,
    role: 'locatario',
    organization_id: invite.organization_id,
    created_by: userId,
  })

  if (profileError || roleError) {
    await admin.auth.admin.deleteUser(userId)
    return { error: 'Não foi possível concluir a ativação. Tente novamente.' }
  }

  const { data: activatedInvite, error: activationError } = await admin
    .from('access_invites')
    .update({
      status: 'activated',
      activated_by: userId,
      activated_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', invite.id)
    .eq('role', 'locatario')
    .eq('status', 'pending')
    .select('id')
    .maybeSingle()

  if (activationError || !activatedInvite) {
    await admin.from('user_roles').delete().eq('user_id', userId).eq('role', 'locatario')
    await admin.auth.admin.deleteUser(userId)
    return { error: 'Não foi possível concluir a ativação. Tente novamente.' }
  }

  redirect('/auth/login?activated=1')
}
