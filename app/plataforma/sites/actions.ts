'use server'

import { revalidatePath } from 'next/cache'
import { requireSuperadmin } from '@/lib/auth/roles'
import { createClient } from '@/lib/supabase/server'
import { getSiteCustomization, type SiteCustomization } from '@/lib/site/customization'

export async function saveSiteDraft(organizationId: string, draft: SiteCustomization) {
  await requireSuperadmin()
  const supabase = await createClient()
  const { error } = await supabase.from('site_customizations').upsert(
    {
      organization_id: organizationId,
      draft,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'organization_id' },
  )
  if (error) return { ok: false, message: 'Não foi possível salvar o rascunho.' }
  revalidatePath(`/plataforma/sites/${organizationId}`)
  return { ok: true, message: 'Rascunho salvo.' }
}

export async function publishSite(organizationId: string, draft: SiteCustomization) {
  await requireSuperadmin()
  const supabase = await createClient()
  const { error } = await supabase.from('site_customizations').upsert(
    {
      organization_id: organizationId,
      draft,
      published: draft,
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'organization_id' },
  )
  if (error) return { ok: false, message: 'Não foi possível publicar o site.' }
  revalidatePath(`/plataforma/sites/${organizationId}`)
  return { ok: true, message: 'Site publicado.' }
}

export async function resetSiteDraft(organizationId: string) {
  await requireSuperadmin()
  const supabase = await createClient()
  const { data: organization } = await supabase
    .from('organizations')
    .select('name, tagline, logo_url, hero_image_url, phone, whatsapp, email, instagram, creci, primary_color, about')
    .eq('id', organizationId)
    .maybeSingle()
  if (!organization) return { ok: false, message: 'Imobiliária não encontrada.' }
  const draft = getSiteCustomization(organization, {})
  const { error } = await supabase.from('site_customizations').upsert(
    { organization_id: organizationId, draft, updated_at: new Date().toISOString() },
    { onConflict: 'organization_id' },
  )
  if (error) return { ok: false, message: 'Não foi possível restaurar os padrões.' }
  revalidatePath(`/plataforma/sites/${organizationId}`)
  return { ok: true, draft, message: 'Padrões restaurados.' }
}
