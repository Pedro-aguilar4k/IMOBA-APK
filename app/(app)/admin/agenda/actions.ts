'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireRole } from '@/lib/auth/roles'
import { createAdminClient } from '@/lib/supabase/admin'

export type ScheduleState = {
  error?: string
  success?: string
}

const scheduleSchema = z.object({
  leadId: z.string().uuid().optional().or(z.literal('')),
  clientName: z.string().trim().min(2, 'Informe o nome do cliente.'),
  corretorId: z.string().uuid('Selecione um corretor.'),
  propertyTitle: z.string().trim().max(160).optional().or(z.literal('')),
  scheduledAt: z.string().min(1, 'Informe a data e a hora.'),
})

export async function scheduleVisit(
  _previous: ScheduleState,
  formData: FormData,
): Promise<ScheduleState> {
  const access = await requireRole('admin')
  const organizationId = access.assignment.organization_id
  if (!organizationId) {
    return { error: 'Sua conta não está vinculada a uma imobiliária.' }
  }

  const parsed = scheduleSchema.safeParse({
    leadId: formData.get('leadId') ?? '',
    clientName: formData.get('clientName'),
    corretorId: formData.get('corretorId'),
    propertyTitle: formData.get('propertyTitle') ?? '',
    scheduledAt: formData.get('scheduledAt'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Revise os dados do agendamento.' }
  }

  const when = new Date(parsed.data.scheduledAt)
  if (Number.isNaN(when.getTime())) {
    return { error: 'Data ou hora inválida.' }
  }

  const admin = createAdminClient()

  // Garante que o corretor pertence à organização do admin.
  const { data: corretorRole } = await admin
    .from('user_roles')
    .select('user_id')
    .eq('user_id', parsed.data.corretorId)
    .eq('organization_id', organizationId)
    .in('role', ['corretor', 'admin'])
    .maybeSingle()

  if (!corretorRole) {
    return { error: 'O corretor selecionado não pertence à sua imobiliária.' }
  }

  const { error } = await admin.from('appointments').insert({
    organization_id: organizationId,
    corretor_id: parsed.data.corretorId,
    lead_id: parsed.data.leadId || null,
    client_name: parsed.data.clientName,
    property_title: parsed.data.propertyTitle || null,
    scheduled_at: when.toISOString(),
    status: 'agendado',
  })

  if (error) {
    return { error: 'Não foi possível salvar o agendamento. Tente novamente.' }
  }

  // Se veio de um lead, avança-o para "visita agendada".
  if (parsed.data.leadId) {
    await admin
      .from('site_leads')
      .update({ status: 'visita', corretor_id: parsed.data.corretorId, updated_at: new Date().toISOString() })
      .eq('id', parsed.data.leadId)
      .eq('organization_id', organizationId)
  }

  revalidatePath('/admin/agenda')
  revalidatePath('/admin')
  return { success: `Visita agendada para ${parsed.data.clientName}.` }
}

const statusSchema = z.object({
  appointmentId: z.string().uuid(),
  status: z.enum(['agendado', 'confirmado', 'concluido', 'cancelado']),
})

export async function updateAppointmentStatus(
  _previous: ScheduleState,
  formData: FormData,
): Promise<ScheduleState> {
  const access = await requireRole('admin')
  const organizationId = access.assignment.organization_id
  if (!organizationId) return { error: 'Conta sem imobiliária vinculada.' }

  const parsed = statusSchema.safeParse({
    appointmentId: formData.get('appointmentId'),
    status: formData.get('status'),
  })
  if (!parsed.success) return { error: 'Dados inválidos.' }

  const admin = createAdminClient()
  const { error } = await admin
    .from('appointments')
    .update({ status: parsed.data.status })
    .eq('id', parsed.data.appointmentId)
    .eq('organization_id', organizationId)

  if (error) return { error: 'Não foi possível atualizar o status.' }

  revalidatePath('/admin/agenda')
  return { success: 'Status atualizado.' }
}
