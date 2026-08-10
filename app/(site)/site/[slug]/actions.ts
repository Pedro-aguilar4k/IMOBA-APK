'use server'

import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'

const leadSchema = z.object({
  organizationId: z.string().uuid(),
  name: z.string().trim().min(2, 'Informe seu nome.').max(120),
  email: z.string().trim().email('Informe um e-mail válido.').max(160).optional().or(z.literal('')),
  phone: z.string().trim().min(8, 'Informe um telefone.').max(40),
  message: z.string().trim().max(1000).optional().or(z.literal('')),
})

export type LeadFormState = {
  status: 'idle' | 'success' | 'error'
  message?: string
}

export async function submitSiteLead(
  _prev: LeadFormState,
  formData: FormData,
): Promise<LeadFormState> {
  const parsed = leadSchema.safeParse({
    organizationId: formData.get('organizationId'),
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    message: formData.get('message'),
  })

  if (!parsed.success) {
    return { status: 'error', message: parsed.error.issues[0]?.message ?? 'Verifique os dados.' }
  }

  const { organizationId, name, email, phone, message } = parsed.data
  const admin = createAdminClient()
  const { error } = await admin.from('site_leads').insert({
    organization_id: organizationId,
    name,
    email: email || null,
    phone,
    message: message || null,
    source: 'site',
    status: 'novo',
  })

  if (error) {
    return { status: 'error', message: 'Não foi possível enviar. Tente novamente.' }
  }
  return { status: 'success', message: 'Recebemos seu contato! Em breve retornaremos.' }
}

/** Registro leve de visita (fire-and-forget a partir do cliente). */
export async function trackVisit(organizationId: string, path: string, device: string) {
  try {
    const admin = createAdminClient()
    await admin.from('site_visits').insert({
      organization_id: organizationId,
      path,
      device: ['desktop', 'mobile', 'tablet'].includes(device) ? device : null,
    })
  } catch {
    // silencioso: tracking nunca deve quebrar a navegação
  }
}
