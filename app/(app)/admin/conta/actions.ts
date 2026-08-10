'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { requireRole } from '@/lib/auth/roles'
import { createAdminClient } from '@/lib/supabase/admin'

export interface DomainState {
  ok?: boolean
  error?: string
}

const domainSchema = z
  .string()
  .trim()
  .toLowerCase()
  // domínio válido: rótulos separados por ponto, TLD com 2+ letras
  .regex(
    /^(?!-)[a-z0-9-]{1,63}(?<!-)(\.(?!-)[a-z0-9-]{1,63}(?<!-))+$/,
    'Informe um domínio válido, como imobiliaria.com.br',
  )

/** Salva/atualiza o domínio personalizado da imobiliária do admin logado. */
export async function saveDomain(
  _prev: DomainState,
  formData: FormData,
): Promise<DomainState> {
  const access = await requireRole('admin')
  const organizationId = access.assignment.organization_id

  if (!organizationId) {
    return { error: 'Sua conta não está vinculada a uma imobiliária.' }
  }

  const raw = String(formData.get('domain') ?? '')
    .trim()
    .toLowerCase()
    // remove protocolo e barra final, se o usuário colar a URL completa
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '')

  const parsed = domainSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Domínio inválido.' }
  }

  const admin = createAdminClient()

  // Garante unicidade do domínio entre imobiliárias.
  const { data: existing } = await admin
    .from('organizations')
    .select('id')
    .eq('custom_domain', parsed.data)
    .neq('id', organizationId)
    .maybeSingle()

  if (existing) {
    return { error: 'Este domínio já está em uso por outra imobiliária.' }
  }

  const { error } = await admin
    .from('organizations')
    .update({ custom_domain: parsed.data, domain_status: 'pendente' })
    .eq('id', organizationId)

  if (error) {
    return { error: 'Não foi possível salvar o domínio. Tente novamente.' }
  }

  revalidatePath('/admin/conta')
  return { ok: true }
}

/** Remove o domínio personalizado configurado. */
export async function removeDomain(): Promise<DomainState> {
  const access = await requireRole('admin')
  const organizationId = access.assignment.organization_id

  if (!organizationId) {
    return { error: 'Sua conta não está vinculada a uma imobiliária.' }
  }

  const admin = createAdminClient()
  const { error } = await admin
    .from('organizations')
    .update({ custom_domain: null, domain_status: 'nao_configurado' })
    .eq('id', organizationId)

  if (error) {
    return { error: 'Não foi possível remover o domínio.' }
  }

  revalidatePath('/admin/conta')
  return { ok: true }
}
