import 'server-only'
import { createAdminClient } from '@/lib/supabase/admin'
import { addSignedUrls } from '@/lib/properties-server'
import type { PropertyRecord } from '@/lib/properties'

export interface SiteOrganization {
  id: string
  name: string
  slug: string
  sitePublished: boolean
}

export interface SiteSettings {
  brandColor: string
  logoUrl: string | null
  heroTitle: string | null
  heroSubtitle: string | null
  aboutText: string | null
  whatsapp: string | null
  phone: string | null
  contactEmail: string | null
  address: string | null
}

export interface SiteData {
  organization: SiteOrganization
  settings: SiteSettings
}

/**
 * A `key` pode ser um slug (subdomínio) ou um domínio próprio (custom_domain).
 * Usa service role porque o site é público — filtramos manualmente por org e
 * só entregamos organizações com o site publicado.
 */
export async function getSiteByKey(key: string): Promise<SiteData | null> {
  const admin = createAdminClient()
  const decoded = decodeURIComponent(key).toLowerCase()

  const { data: org } = await admin
    .from('organizations')
    .select('id, name, slug, site_published, custom_domain, custom_domain_verified')
    .or(`slug.eq.${decoded},custom_domain.eq.${decoded}`)
    .maybeSingle()

  if (!org) return null
  // Domínio próprio só resolve se verificado.
  if (org.custom_domain === decoded && !org.custom_domain_verified && org.slug !== decoded) {
    return null
  }

  const { data: settings } = await admin
    .from('org_site_settings')
    .select('*')
    .eq('organization_id', org.id)
    .maybeSingle()

  return {
    organization: {
      id: org.id,
      name: org.name,
      slug: org.slug,
      sitePublished: org.site_published,
    },
    settings: {
      brandColor: settings?.brand_color ?? '#2563eb',
      logoUrl: settings?.logo_url ?? null,
      heroTitle: settings?.hero_title ?? null,
      heroSubtitle: settings?.hero_subtitle ?? null,
      aboutText: settings?.about_text ?? null,
      whatsapp: settings?.whatsapp ?? null,
      phone: settings?.phone ?? null,
      contactEmail: settings?.contact_email ?? null,
      address: settings?.address ?? null,
    },
  }
}

export interface SitePropertyCard {
  id: string
  title: string
  city: string | null
  neighborhood: string | null
  bedrooms: number | null
  bathrooms: number | null
  parkingSpaces: number | null
  areaSqm: number | null
  rentValue: number | null
  propertyType: string | null
  status: string
  coverUrl: string | null
}

/** Lista de imóveis públicos (disponíveis) da corretora, com capa assinada. */
export async function getSiteProperties(organizationId: string): Promise<SitePropertyCard[]> {
  const admin = createAdminClient()
  const { data: properties } = await admin
    .from('properties')
    .select(
      'id, title, city, neighborhood, bedrooms, bathrooms, parking_spaces, usable_area_sqm, area_sqm, rent_value, property_type, status',
    )
    .eq('organization_id', organizationId)
    .eq('status', 'available')
    .order('created_at', { ascending: false })

  if (!properties?.length) return []

  const ids = properties.map((p) => p.id)
  const { data: media } = await admin
    .from('property_media')
    .select('property_id, storage_path, position, is_cover')
    .in('property_id', ids)
    .order('position', { ascending: true })

  // capa: is_cover primeiro; senão, primeira mídia por posição
  const coverByProperty = new Map<string, string>()
  for (const m of media ?? []) {
    if (!coverByProperty.has(m.property_id) || m.is_cover) {
      coverByProperty.set(m.property_id, m.storage_path)
    }
  }

  const signedByProperty = new Map<string, string>()
  await Promise.all(
    Array.from(coverByProperty.entries()).map(async ([propertyId, storagePath]) => {
      const { data } = await admin.storage.from('property-media').createSignedUrl(storagePath, 3600)
      if (data?.signedUrl) signedByProperty.set(propertyId, data.signedUrl)
    }),
  )

  return properties.map((p) => ({
    id: p.id,
    title: p.title,
    city: p.city,
    neighborhood: p.neighborhood,
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    parkingSpaces: p.parking_spaces,
    areaSqm: p.usable_area_sqm ?? p.area_sqm,
    rentValue: p.rent_value,
    propertyType: p.property_type,
    status: p.status,
    coverUrl: signedByProperty.get(p.id) ?? null,
  }))
}

/** Detalhe público de um imóvel + galeria assinada. Garante que pertence à org. */
export async function getSitePropertyDetail(organizationId: string, propertyId: string) {
  const admin = createAdminClient()
  const { data: property } = await admin
    .from('properties')
    .select('*')
    .eq('id', propertyId)
    .eq('organization_id', organizationId)
    .eq('status', 'available')
    .maybeSingle()

  if (!property) return null

  const { data: mediaRows } = await admin
    .from('property_media')
    .select('id, property_id, organization_id, storage_path, position, is_cover, mime_type, file_size, created_at')
    .eq('property_id', propertyId)
    .order('position', { ascending: true })

  const signed = await addSignedUrls(admin, mediaRows ?? [])

  return {
    property: property as PropertyRecord,
    media: signed.filter((m) => m.signedUrl),
  }
}
