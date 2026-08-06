'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireOrgRole, logAudit } from '@/lib/auth/tenant'
import { createAdminClient } from '@/lib/supabase/admin'

const settingsSchema = z.object({
  brandColor: z
    .string()
    .regex(/^#([0-9a-fA-F]{6})$/, 'Use uma cor no formato #RRGGBB.'),
  logoUrl: z.string().url('URL do logo inválida.').optional().or(z.literal('')),
  heroTitle: z.string().max(120).optional().or(z.literal('')),
  heroSubtitle: z.string().max(200).optional().or(z.literal('')),
  aboutText: z.string().max(2000).optional().or(z.literal('')),
  whatsapp: z.string().max(40).optional().or(z.literal('')),
  phone: z.string().max(40).optional().or(z.literal('')),
  contactEmail: z.string().email('E-mail inválido.').optional().or(z.literal('')),
  address: z.string().max(200).optional().or(z.literal('')),
})

export interface SiteSettingsState {
  error?: string
  success?: boolean
}

export async function saveSiteSettings(
  _prev: SiteSettingsState,
  formData: FormData,
): Promise<SiteSettingsState> {
  const ctx = await requireOrgRole('org_admin')

  const parsed = settingsSchema.safeParse({
    brandColor: formData.get('brandColor'),
    logoUrl: formData.get('logoUrl'),
    heroTitle: formData.get('heroTitle'),
    heroSubtitle: formData.get('heroSubtitle'),
    aboutText: formData.get('aboutText'),
    whatsapp: formData.get('whatsapp'),
    phone: formData.get('phone'),
    contactEmail: formData.get('contactEmail'),
    address: formData.get('address'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' }
  }

  const v = parsed.data
  const admin = createAdminClient()
  const { error } = await admin
    .from('org_site_settings')
    .update({
      brand_color: v.brandColor,
      logo_url: v.logoUrl || null,
      hero_title: v.heroTitle || null,
      hero_subtitle: v.heroSubtitle || null,
      about_text: v.aboutText || null,
      whatsapp: v.whatsapp || null,
      phone: v.phone || null,
      contact_email: v.contactEmail || null,
      address: v.address || null,
      updated_at: new Date().toISOString(),
      updated_by: ctx.userId,
    })
    .eq('organization_id', ctx.organizationId)

  if (error) return { error: 'Não foi possível salvar as configurações.' }

  await logAudit({
    actorUserId: ctx.userId,
    organizationId: ctx.organizationId,
    impersonated: Boolean(ctx.impersonation),
    action: 'site.settings_updated',
    entity: 'org_site_settings',
  })
  revalidatePath('/dashboard/corretor/site')
  return { success: true }
}

export async function toggleSitePublished(publish: boolean) {
  const ctx = await requireOrgRole('org_admin')
  const admin = createAdminClient()

  const { error } = await admin
    .from('organizations')
    .update({ site_published: publish })
    .eq('id', ctx.organizationId)

  if (error) return { error: 'Não foi possível atualizar a publicação.' }

  await logAudit({
    actorUserId: ctx.userId,
    organizationId: ctx.organizationId,
    impersonated: Boolean(ctx.impersonation),
    action: publish ? 'site.published' : 'site.unpublished',
    entity: 'organizations',
    entityId: ctx.organizationId,
  })
  revalidatePath('/dashboard/corretor/site')
  return { success: true }
}

export async function updateLeadStatus(leadId: string, status: 'new' | 'contacted' | 'archived') {
  const ctx = await requireOrgRole('corretor')
  const admin = createAdminClient()

  const { error } = await admin
    .from('leads')
    .update({ status })
    .eq('id', leadId)
    .eq('organization_id', ctx.organizationId)

  if (error) return { error: 'Não foi possível atualizar o lead.' }

  revalidatePath('/dashboard/corretor/site')
  revalidatePath('/dashboard/corretor/leads')
  return { success: true }
}
