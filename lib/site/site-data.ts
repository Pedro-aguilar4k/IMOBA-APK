import 'server-only'

import { createAdminClient } from '@/lib/supabase/admin'
import { getSiteCustomization, type SiteCustomization } from './customization'

export type ListingPurpose = 'aluguel' | 'venda' | 'ambos'

export interface SiteOrganization {
  id: string
  name: string
  slug: string
  logo_url: string | null
  hero_image_url: string | null
  tagline: string | null
  about: string | null
  phone: string | null
  whatsapp: string | null
  email: string | null
  instagram: string | null
  creci: string | null
  city: string | null
  state: string | null
  primary_color: string | null
}

export interface SiteProperty {
  id: string
  title: string
  description: string | null
  neighborhood: string | null
  city: string
  state: string
  property_type: string
  listing_purpose: ListingPurpose
  bedrooms: number | null
  suites: number
  bathrooms: number | null
  parking_spaces: number
  usable_area_sqm: number | null
  rent_value: number | null
  sale_value: number | null
  condominium_value: number
  iptu_value: number
  features: string[]
  cover_url: string | null
  latitude: number | null
  longitude: number | null
  created_at: string
}

export interface SitePropertyDetail extends SiteProperty {
  address: string
  street: string | null
  street_number: string | null
  complement: string | null
  zip_code: string | null
  total_area_sqm: number | null
  floor_number: number | null
  property_age: number | null
  boundary: unknown | null
  images: string[]
}

export interface PropertyFilters {
  purpose?: ListingPurpose | 'todos'
  type?: string
  city?: string
  neighborhood?: string
  bedrooms?: number
  minArea?: number
  maxArea?: number
  q?: string
  maxPrice?: number
}

const ORG_FIELDS =
  'id, name, slug, logo_url, hero_image_url, tagline, about, phone, whatsapp, email, instagram, creci, city, state, primary_color'

/** Resolve o caminho da mídia: paths públicos (/...) ou URLs http são usados como estão. */
export function resolveMediaUrl(storagePath: string | null): string | null {
  if (!storagePath) return null
  if (storagePath.startsWith('http') || storagePath.startsWith('/')) return storagePath
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  return `${supabaseUrl}/storage/v1/object/public/property-media/${storagePath}`
}

export async function getOrganizationBySlug(slug: string): Promise<SiteOrganization | null> {
  const admin = createAdminClient()
  const { data } = await admin.from('organizations').select(ORG_FIELDS).eq('slug', slug).maybeSingle()
  return (data as SiteOrganization | null) ?? null
}

export async function getPublishedSiteCustomization(
  organization: SiteOrganization,
): Promise<SiteCustomization> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('site_customizations')
    .select('published')
    .eq('organization_id', organization.id)
    .maybeSingle()
  return getSiteCustomization(organization, data?.published)
}

export async function getOrganizationByDomain(domain: string): Promise<SiteOrganization | null> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('organizations')
    .select(ORG_FIELDS)
    .eq('custom_domain', domain)
    .eq('domain_status', 'verified')
    .maybeSingle()
  return (data as SiteOrganization | null) ?? null
}

function coverFromMedia(media: { property_id: string; storage_path: string; is_cover: boolean; position: number }[]) {
  const byProperty = new Map<string, string>()
  const sorted = [...media].sort(
    (a, b) => Number(b.is_cover) - Number(a.is_cover) || a.position - b.position,
  )
  for (const m of sorted) {
    if (!byProperty.has(m.property_id)) {
      const url = resolveMediaUrl(m.storage_path)
      if (url) byProperty.set(m.property_id, url)
    }
  }
  return byProperty
}

/** Lista imóveis públicos (apenas disponíveis) de uma organização, com filtros e escopo por tenant. */
export async function listPublicProperties(
  organizationId: string,
  filters: PropertyFilters = {},
): Promise<SiteProperty[]> {
  const admin = createAdminClient()
  let query = admin
    .from('properties')
    .select(
      'id, title, description, neighborhood, city, state, property_type, listing_purpose, bedrooms, suites, bathrooms, parking_spaces, usable_area_sqm, rent_value, sale_value, condominium_value, iptu_value, features, latitude, longitude, created_at',
    )
    .eq('organization_id', organizationId)
    .eq('available', true)
    .order('created_at', { ascending: false })

  if (filters.purpose && filters.purpose !== 'todos') {
    query = query.in('listing_purpose', [filters.purpose, 'ambos'])
  }
  if (filters.type) query = query.eq('property_type', filters.type)
  if (filters.city) query = query.ilike('city', `%${filters.city}%`)
  if (filters.neighborhood) query = query.ilike('neighborhood', `%${filters.neighborhood}%`)
  if (filters.bedrooms) query = query.gte('bedrooms', filters.bedrooms)
  if (filters.minArea) query = query.gte('usable_area_sqm', filters.minArea)
  if (filters.maxArea) query = query.lte('usable_area_sqm', filters.maxArea)
  if (filters.q) query = query.or(`title.ilike.%${filters.q}%,neighborhood.ilike.%${filters.q}%,city.ilike.%${filters.q}%`)

  const { data: rows } = await query
  const properties = (rows ?? []) as Omit<SiteProperty, 'cover_url'>[]
  if (properties.length === 0) return []

  const { data: media } = await admin
    .from('property_media')
    .select('property_id, storage_path, is_cover, position')
    .eq('organization_id', organizationId)
    .in(
      'property_id',
      properties.map((p) => p.id),
    )
  const covers = coverFromMedia(media ?? [])

  let result = properties.map((p) => ({ ...p, cover_url: covers.get(p.id) ?? null }))

  // Filtro de preço aplicado no servidor (considera aluguel ou venda conforme finalidade).
  if (filters.maxPrice) {
    const max = filters.maxPrice
    result = result.filter((p) => {
      const price = p.listing_purpose === 'venda' ? p.sale_value : p.rent_value
      return (price ?? 0) <= max
    })
  }
  return result
}

/** Detalhe de um imóvel público, com todas as imagens. */
export async function getPublicProperty(
  organizationId: string,
  propertyId: string,
): Promise<SitePropertyDetail | null> {
  const admin = createAdminClient()
  const { data: property } = await admin
    .from('properties')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('id', propertyId)
    .eq('available', true)
    .maybeSingle()
  if (!property) return null

  const { data: media } = await admin
    .from('property_media')
    .select('storage_path, is_cover, position')
    .eq('organization_id', organizationId)
    .eq('property_id', propertyId)
    .order('is_cover', { ascending: false })
    .order('position', { ascending: true })

  const images = (media ?? [])
    .map((m) => resolveMediaUrl(m.storage_path))
    .filter((url): url is string => Boolean(url))

  return { ...(property as SitePropertyDetail), images, cover_url: images[0] ?? null }
}

export function priceFor(property: Pick<SiteProperty, 'listing_purpose' | 'rent_value' | 'sale_value'>) {
  if (property.listing_purpose === 'venda') return { value: property.sale_value, suffix: '' }
  return { value: property.rent_value, suffix: '/mês' }
}

export interface SiteNearbyPlace {
  id: string
  name: string
  category: string
  distance_m: number | null
  latitude: number | null
  longitude: number | null
}

/** Pontos próximos de um imóvel público (mercado, farmácia, escola...). */
export async function getPropertyNearbyPlaces(
  organizationId: string,
  propertyId: string,
): Promise<SiteNearbyPlace[]> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('property_nearby_places')
    .select('id, name, category, distance_m, latitude, longitude')
    .eq('organization_id', organizationId)
    .eq('property_id', propertyId)
    .order('distance_m', { nullsFirst: false })

  return (data ?? []) as SiteNearbyPlace[]
}
