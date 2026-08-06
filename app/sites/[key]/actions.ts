'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { getSiteByKey } from '@/lib/sites/site-data'

export interface LeadFormState {
  error?: string
  success?: boolean
}

export async function submitLead(
  key: string,
  _prev: LeadFormState,
  formData: FormData,
): Promise<LeadFormState> {
  const site = await getSiteByKey(key)
  if (!site || !site.organization.sitePublished) {
    return { error: 'Site indisponível no momento.' }
  }

  const name = String(formData.get('name') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim()
  const phone = String(formData.get('phone') ?? '').trim()
  const message = String(formData.get('message') ?? '').trim()
  const propertyId = String(formData.get('propertyId') ?? '').trim() || null

  if (name.length < 2) return { error: 'Informe seu nome.' }
  if (!email && !phone) return { error: 'Informe um e-mail ou telefone para contato.' }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: 'E-mail inválido.' }
  }

  const admin = createAdminClient()
  const { error } = await admin.from('leads').insert({
    organization_id: site.organization.id,
    property_id: propertyId,
    name,
    email: email || null,
    phone: phone || null,
    message: message || null,
    source: propertyId ? 'site-property' : 'site',
  })

  if (error) return { error: 'Não foi possível enviar. Tente novamente.' }
  return { success: true }
}
