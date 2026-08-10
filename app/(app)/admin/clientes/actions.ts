'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireRole } from '@/lib/auth/roles'
import { createAdminClient } from '@/lib/supabase/admin'

export type ClientState = {
  error?: string
  success?: string
}

async function requireOrg() {
  const access = await requireRole('admin')
  const organizationId = access.assignment.organization_id
  if (!organizationId) return null
  return { access, organizationId }
}

const convertSchema = z.object({
  leadId: z.string().uuid('Lead inválido.'),
})

export async function convertLeadToClient(
  _previous: ClientState,
  formData: FormData,
): Promise<ClientState> {
  const ctx = await requireOrg()
  if (!ctx) return { error: 'Sua conta não está vinculada a uma imobiliária.' }

  const parsed = convertSchema.safeParse({ leadId: formData.get('leadId') })
  if (!parsed.success) return { error: 'Lead inválido.' }

  const admin = createAdminClient()

  const { data: lead } = await admin
    .from('site_leads')
    .select('*')
    .eq('id', parsed.data.leadId)
    .eq('organization_id', ctx.organizationId)
    .maybeSingle()

  if (!lead) return { error: 'Lead não encontrado.' }

  // Evita duplicidade (índice único em lead_id também protege).
  const { data: existing } = await admin
    .from('clients')
    .select('id')
    .eq('lead_id', lead.id)
    .maybeSingle()
  if (existing) return { error: 'Este lead já foi convertido em cliente.' }

  const { error: insertError } = await admin.from('clients').insert({
    organization_id: ctx.organizationId,
    lead_id: lead.id,
    corretor_id: lead.corretor_id,
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    notes: lead.message,
    status: 'ativo',
  })

  if (insertError) return { error: 'Não foi possível converter o lead.' }

  // Marca o lead como fechado.
  await admin
    .from('site_leads')
    .update({ status: 'fechado', updated_at: new Date().toISOString() })
    .eq('id', lead.id)
    .eq('organization_id', ctx.organizationId)

  revalidatePath('/admin/clientes')
  revalidatePath('/admin')
  return { success: `${lead.name} agora é cliente.` }
}

const createSchema = z.object({
  name: z.string().trim().min(2, 'Informe o nome do cliente.'),
  email: z.string().trim().toLowerCase().email('E-mail inválido.').optional().or(z.literal('')),
  phone: z.string().trim().max(40).optional().or(z.literal('')),
  document: z.string().trim().max(40).optional().or(z.literal('')),
  notes: z.string().trim().max(500).optional().or(z.literal('')),
})

export async function createClientManually(
  _previous: ClientState,
  formData: FormData,
): Promise<ClientState> {
  const ctx = await requireOrg()
  if (!ctx) return { error: 'Sua conta não está vinculada a uma imobiliária.' }

  const parsed = createSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email') ?? '',
    phone: formData.get('phone') ?? '',
    document: formData.get('document') ?? '',
    notes: formData.get('notes') ?? '',
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Revise os dados do cliente.' }
  }

  const admin = createAdminClient()
  const { error } = await admin.from('clients').insert({
    organization_id: ctx.organizationId,
    name: parsed.data.name,
    email: parsed.data.email || null,
    phone: parsed.data.phone || null,
    document: parsed.data.document || null,
    notes: parsed.data.notes || null,
    status: 'ativo',
  })

  if (error) return { error: 'Não foi possível cadastrar o cliente.' }

  revalidatePath('/admin/clientes')
  return { success: `${parsed.data.name} cadastrado como cliente.` }
}

const toggleSchema = z.object({
  clientId: z.string().uuid(),
  status: z.enum(['ativo', 'inativo']),
})

export async function setClientStatus(
  _previous: ClientState,
  formData: FormData,
): Promise<ClientState> {
  const ctx = await requireOrg()
  if (!ctx) return { error: 'Conta sem imobiliária vinculada.' }

  const parsed = toggleSchema.safeParse({
    clientId: formData.get('clientId'),
    status: formData.get('status'),
  })
  if (!parsed.success) return { error: 'Dados inválidos.' }

  const admin = createAdminClient()
  const { error } = await admin
    .from('clients')
    .update({ status: parsed.data.status, updated_at: new Date().toISOString() })
    .eq('id', parsed.data.clientId)
    .eq('organization_id', ctx.organizationId)

  if (error) return { error: 'Não foi possível atualizar o cliente.' }

  revalidatePath('/admin/clientes')
  return { success: 'Cliente atualizado.' }
}
