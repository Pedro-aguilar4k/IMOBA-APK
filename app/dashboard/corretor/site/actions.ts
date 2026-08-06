'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { getTenantContext, requireOrgRole, logAudit } from '@/lib/auth/tenant'
import { createAdminClient } from '@/lib/supabase/admin'
import { isSiteFont } from '@/lib/sites/fonts'

const hex = z.string().regex(/^#([0-9a-fA-F]{6})$/, 'Use uma cor no formato #RRGGBB.')
const fontField = z
  .string()
  .refine((v) => isSiteFont(v), 'Fonte inválida.')
  .optional()
  .or(z.literal(''))

const settingsSchema = z.object({
  brandColor: hex,
  secondaryColor: hex,
  accentColor: hex,
  backgroundColor: hex,
  headingFont: fontField,
  bodyFont: fontField,
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

interface Authorized {
  organizationId: string
  userId: string
  impersonated: boolean
}

/**
 * Autoriza edição das configurações do site.
 * - Superadmin (sem impersonação): edita a org informada em `organizationId`.
 * - Dono/impersonação: apenas a própria org.
 */
async function authorizeSettings(organizationId?: string): Promise<Authorized | { error: string }> {
  const ctx = await getTenantContext()
  if (!ctx) return { error: 'Sessão expirada. Faça login novamente.' }

  if (ctx.isPlatformAdmin && !ctx.impersonation) {
    if (!organizationId) return { error: 'Imobiliária inválida.' }
    return { organizationId, userId: ctx.userId, impersonated: false }
  }

  const activeOrg = ctx.organizationId
  if (!activeOrg) return { error: 'Você não tem acesso a uma imobiliária.' }
  if (organizationId && organizationId !== activeOrg) return { error: 'Acesso negado.' }
  const isOwner = ctx.role === 'org_admin' || Boolean(ctx.impersonation)
  if (!isOwner) return { error: 'Apenas o responsável pode personalizar o site.' }

  return { organizationId: activeOrg, userId: ctx.userId, impersonated: Boolean(ctx.impersonation) }
}

export async function saveSiteSettings(
  _prev: SiteSettingsState,
  formData: FormData,
): Promise<SiteSettingsState> {
  const orgFromForm = formData.get('organizationId')
  const auth = await authorizeSettings(typeof orgFromForm === 'string' ? orgFromForm : undefined)
  if ('error' in auth) return { error: auth.error }

  const parsed = settingsSchema.safeParse({
    brandColor: formData.get('brandColor'),
    secondaryColor: formData.get('secondaryColor'),
    accentColor: formData.get('accentColor'),
    backgroundColor: formData.get('backgroundColor'),
    headingFont: formData.get('headingFont'),
    bodyFont: formData.get('bodyFont'),
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
      secondary_color: v.secondaryColor,
      accent_color: v.accentColor,
      background_color: v.backgroundColor,
      heading_font: v.headingFont || 'Geist',
      body_font: v.bodyFont || 'Geist',
      hero_title: v.heroTitle || null,
      hero_subtitle: v.heroSubtitle || null,
      about_text: v.aboutText || null,
      whatsapp: v.whatsapp || null,
      phone: v.phone || null,
      contact_email: v.contactEmail || null,
      address: v.address || null,
      updated_at: new Date().toISOString(),
      updated_by: auth.userId,
    })
    .eq('organization_id', auth.organizationId)

  if (error) return { error: 'Não foi possível salvar as configurações.' }

  await logAudit({
    actorUserId: auth.userId,
    organizationId: auth.organizationId,
    impersonated: auth.impersonated,
    action: 'site.settings_updated',
    entity: 'org_site_settings',
  })
  revalidatePath('/dashboard/corretor/site')
  revalidatePath('/admin')
  return { success: true }
}

const appSchema = z.object({
  organizationId: z.string().uuid(),
  appName: z.string().max(60).optional().or(z.literal('')),
})

/** Configurações do app — exclusivas do superadmin. */
export async function saveAppSettings(
  _prev: SiteSettingsState,
  formData: FormData,
): Promise<SiteSettingsState> {
  const ctx = await getTenantContext()
  if (!ctx?.isPlatformAdmin || ctx.impersonation) {
    return { error: 'Apenas a plataforma pode configurar o app.' }
  }

  const parsed = appSchema.safeParse({
    organizationId: formData.get('organizationId'),
    appName: formData.get('appName'),
  })
  if (!parsed.success) return { error: 'Dados do app inválidos.' }

  const admin = createAdminClient()
  const { error } = await admin
    .from('org_site_settings')
    .update({ app_name: parsed.data.appName || null, updated_at: new Date().toISOString(), updated_by: ctx.userId })
    .eq('organization_id', parsed.data.organizationId)

  if (error) return { error: 'Não foi possível salvar as configurações do app.' }

  revalidatePath('/admin')
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
