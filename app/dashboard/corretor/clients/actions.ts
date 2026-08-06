'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireRole } from '@/lib/auth/roles'
import { createAdminClient } from '@/lib/supabase/admin'
import { digitsOnly, hashIdentifier } from '@/lib/security/identifiers'

export type TenantInviteState = {
  error?: string
  success?: string
}

const tenantSchema = z.object({
  name: z.string().trim().min(2, 'Informe o nome completo.'),
  cpf: z.string().min(1, 'Informe o CPF.'),
  birthDate: z.iso.date('Informe uma data de nascimento válida.'),
})

export async function createTenantInvite(
  _previousState: TenantInviteState,
  formData: FormData,
): Promise<TenantInviteState> {
  const access = await requireRole('corretor')
  const organizationId = access.assignment.organization_id
  if (!organizationId) return { error: 'Sua conta não está vinculada a uma imobiliária.' }

  const parsed = tenantSchema.safeParse({
    name: formData.get('name'),
    cpf: formData.get('cpf'),
    birthDate: formData.get('birthDate'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Revise os dados informados.' }
  }

  const cpf = digitsOnly(parsed.data.cpf)
  if (cpf.length !== 11) return { error: 'Informe um CPF com 11 dígitos.' }

  const birthDate = new Date(`${parsed.data.birthDate}T00:00:00`)
  if (Number.isNaN(birthDate.getTime()) || birthDate >= new Date()) {
    return { error: 'Informe uma data de nascimento válida.' }
  }

  const admin = createAdminClient()
  const documentHash = hashIdentifier(cpf)
  const [{ data: existingProfile }, { data: existingInvite }] = await Promise.all([
    admin.from('profiles').select('id').eq('cpf', cpf).maybeSingle(),
    admin.from('access_invites').select('id').eq('role', 'locatario').eq('document_hash', documentHash).eq('status', 'pending').maybeSingle(),
  ])

  if (existingProfile || existingInvite) {
    return { error: 'Este CPF já possui cadastro ou primeiro acesso pendente.' }
  }

  const { error } = await admin.from('access_invites').insert({
    role: 'locatario',
    organization_id: organizationId,
    name: parsed.data.name,
    document_hash: documentHash,
    document_last4: cpf.slice(-4),
    birth_date: parsed.data.birthDate,
    created_by: access.userId,
  })

  if (error) return { error: 'Não foi possível cadastrar o locatário.' }

  revalidatePath('/dashboard/corretor/clients')
  return { success: 'Locatário cadastrado. Ele já pode fazer o primeiro acesso com CPF e data de nascimento.' }
}
