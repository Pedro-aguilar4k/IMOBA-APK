import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { requireSuperadmin } from '@/lib/auth/roles'
import { createAdminClient } from '@/lib/supabase/admin'
import { getSiteCustomization, type SiteCustomization } from '@/lib/site/customization'
import { SiteEditor } from '@/components/plataforma/site-editor'

export const metadata: Metadata = { title: 'Editor do site | IMOBA' }

export default async function SiteEditorPage({ params }: { params: Promise<{ id: string }> }) {
  await requireSuperadmin()
  const { id } = await params
  const admin = createAdminClient()
  const { data: organization } = await admin
    .from('organizations')
    .select('id, name, slug, logo_url, hero_image_url, tagline, about, phone, whatsapp, email, instagram, creci, city, state, primary_color')
    .eq('id', id)
    .maybeSingle()
  if (!organization) notFound()

  const { data: customization } = await admin
    .from('site_customizations')
    .select('draft, published_at')
    .eq('organization_id', id)
    .maybeSingle()
  const initial = getSiteCustomization(organization, customization?.draft)

  return (
    <SiteEditor
      organization={organization}
      initialDraft={initial as SiteCustomization}
      publishedAt={customization?.published_at ?? null}
    />
  )
}
