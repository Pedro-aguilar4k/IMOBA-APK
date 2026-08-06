import 'server-only'

import type { SupabaseClient } from '@supabase/supabase-js'
import type { PropertyMediaRecord, PropertyRecord } from '@/lib/properties'
import type { PropertyListItem } from '@/components/dashboard/properties-list'

export async function getPropertyList(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<PropertyListItem[]> {
  const { data: properties, error } = await supabase
    .from('properties')
    .select('id, title, address, neighborhood, city, state, bedrooms, bathrooms, usable_area_sqm, area_sqm, rent_value, status')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })

  if (error || !properties?.length) return []

  const { data: covers } = await supabase
    .from('property_media')
    .select('property_id, storage_path')
    .in('property_id', properties.map((property) => property.id))
    .eq('is_cover', true)

  const coverUrls = new Map<string, string>()
  await Promise.all((covers ?? []).map(async (cover) => {
    const { data } = await supabase.storage.from('property-media').createSignedUrl(cover.storage_path, 3600)
    if (data?.signedUrl) coverUrls.set(cover.property_id, data.signedUrl)
  }))

  return properties.map((property) => ({
    ...property,
    status: property.status as PropertyRecord['status'],
    coverUrl: coverUrls.get(property.id),
  }))
}

export async function addSignedUrls(supabase: SupabaseClient, media: PropertyMediaRecord[]) {
  return Promise.all(
    media.map(async (item) => {
      const { data } = await supabase.storage.from('property-media').createSignedUrl(item.storage_path, 3600)
      return { ...item, signedUrl: data?.signedUrl }
    }),
  )
}
