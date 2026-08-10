'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/auth/roles'
import {
  fetchMapboxNearby,
  isNearbyCategory,
  type NearbyPlace,
  type NearbySuggestion,
} from '@/lib/nearby-places'

const MAX_PLACES = 40

/** Normaliza nomes para comparação (remove acentos, caixa e espaços repetidos). */
function normalizeName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

interface OwnedProperty {
  userId: string
  organizationId: string
  latitude: number | null
  longitude: number | null
}

async function getOwnedProperty(propertyId: string): Promise<OwnedProperty | null> {
  const access = await requireRole('corretor')
  const organizationId = access.assignment.organization_id
  if (!organizationId) return null

  const supabase = await createClient()
  const { data } = await supabase
    .from('properties')
    .select('id, latitude, longitude')
    .eq('id', propertyId)
    .eq('corretor_id', access.userId)
    .eq('organization_id', organizationId)
    .maybeSingle()

  if (!data) return null
  return { userId: access.userId, organizationId, latitude: data.latitude, longitude: data.longitude }
}

function revalidateProperty(propertyId: string) {
  revalidatePath(`/dashboard/corretor/properties/${propertyId}`)
  revalidatePath(`/dashboard/corretor/properties/${propertyId}/edit`)
}

export async function suggestNearbyPlaces(
  propertyId: string,
): Promise<{ suggestions?: NearbySuggestion[]; error?: string }> {
  const owned = await getOwnedProperty(propertyId)
  if (!owned) return { error: 'Imóvel não encontrado.' }
  if (owned.latitude == null || owned.longitude == null) {
    return { error: 'Cadastre a latitude e longitude do imóvel para buscar pontos próximos.' }
  }

  const suggestions = await fetchMapboxNearby(owned.latitude, owned.longitude)
  if (!suggestions.length) {
    return { error: 'Nenhum ponto próximo encontrado automaticamente. Você pode adicionar manualmente.' }
  }
  return { suggestions }
}

export async function addNearbyPlace(
  propertyId: string,
  input: {
    name: string
    category: string
    distance_m?: number | null
    latitude?: number | null
    longitude?: number | null
    source?: 'mapbox' | 'manual'
  },
): Promise<{ error?: string; success?: boolean }> {
  const owned = await getOwnedProperty(propertyId)
  if (!owned) return { error: 'Imóvel não encontrado.' }

  const name = input.name?.trim()
  if (!name) return { error: 'Informe o nome do ponto.' }
  if (!isNearbyCategory(input.category)) return { error: 'Categoria inválida.' }

  const supabase = await createClient()
  const { count } = await supabase
    .from('property_nearby_places')
    .select('id', { count: 'exact', head: true })
    .eq('property_id', propertyId)
  if ((count ?? 0) >= MAX_PLACES) return { error: `Limite de ${MAX_PLACES} pontos por imóvel.` }

  const { error } = await supabase.from('property_nearby_places').insert({
    property_id: propertyId,
    organization_id: owned.organizationId,
    name: name.slice(0, 120),
    category: input.category,
    distance_m: input.distance_m != null && input.distance_m >= 0 ? Math.round(input.distance_m) : null,
    latitude: input.latitude ?? null,
    longitude: input.longitude ?? null,
    source: input.source === 'mapbox' ? 'mapbox' : 'manual',
    position: count ?? 0,
    created_by: owned.userId,
  })

  if (error) return { error: 'Não foi possível adicionar o ponto.' }
  revalidateProperty(propertyId)
  return { success: true }
}

export async function importNearbyPlaces(
  propertyId: string,
  suggestions: NearbySuggestion[],
): Promise<{ error?: string; success?: boolean; added?: number }> {
  const owned = await getOwnedProperty(propertyId)
  if (!owned) return { error: 'Imóvel não encontrado.' }

  const valid = suggestions
    .filter((s) => s.name?.trim() && isNearbyCategory(s.category))
    .slice(0, MAX_PLACES)
  if (!valid.length) return { error: 'Nenhum ponto válido para importar.' }

  const supabase = await createClient()
  const { data: existing, count } = await supabase
    .from('property_nearby_places')
    .select('name, category', { count: 'exact' })
    .eq('property_id', propertyId)

  const seen = new Set((existing ?? []).map((e) => `${e.category}:${normalizeName(e.name)}`))
  let position = count ?? 0
  const rows = valid
    .filter((s) => {
      const key = `${s.category}:${normalizeName(s.name)}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .slice(0, MAX_PLACES - (count ?? 0))
    .map((s) => ({
      property_id: propertyId,
      organization_id: owned.organizationId,
      name: s.name.trim().slice(0, 120),
      category: s.category,
      distance_m: Math.round(s.distance_m),
      latitude: s.latitude,
      longitude: s.longitude,
      source: 'mapbox' as const,
      position: position++,
      created_by: owned.userId,
    }))

  if (!rows.length) return { error: 'Esses pontos já foram adicionados.' }

  const { error } = await supabase.from('property_nearby_places').insert(rows)
  if (error) return { error: 'Não foi possível importar os pontos.' }
  revalidateProperty(propertyId)
  return { success: true, added: rows.length }
}

/**
 * Preenche automaticamente os pontos próximos ao publicar o imóvel.
 * - Só roda se o imóvel tiver latitude/longitude.
 * - Pula se já existirem pontos vindos do Mapbox (evita re-buscar a cada edição).
 * - Deduplica contra os pontos já cadastrados, incluindo os adicionados manualmente
 *   pelo corretor (ex.: se ele já adicionou "Mercado LM", não traz de novo).
 */
export async function autoPopulateNearbyPlaces(
  propertyId: string,
): Promise<{ added: number }> {
  const owned = await getOwnedProperty(propertyId)
  if (!owned || owned.latitude == null || owned.longitude == null) return { added: 0 }

  const supabase = await createClient()
  const { data: existing, count } = await supabase
    .from('property_nearby_places')
    .select('name, category, source', { count: 'exact' })
    .eq('property_id', propertyId)

  // Já foi populado automaticamente antes: não repete a busca.
  if ((existing ?? []).some((e) => e.source === 'mapbox')) return { added: 0 }

  const suggestions = await fetchMapboxNearby(owned.latitude, owned.longitude)
  if (!suggestions.length) return { added: 0 }

  const seen = new Set((existing ?? []).map((e) => `${e.category}:${normalizeName(e.name)}`))
  let position = count ?? 0
  const rows = suggestions
    .filter((s) => s.name?.trim() && isNearbyCategory(s.category))
    .filter((s) => {
      const key = `${s.category}:${normalizeName(s.name)}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .slice(0, MAX_PLACES - (count ?? 0))
    .map((s) => ({
      property_id: propertyId,
      organization_id: owned.organizationId,
      name: s.name.trim().slice(0, 120),
      category: s.category,
      distance_m: Math.round(s.distance_m),
      latitude: s.latitude,
      longitude: s.longitude,
      source: 'mapbox' as const,
      position: position++,
      created_by: owned.userId,
    }))

  if (!rows.length) return { added: 0 }

  const { error } = await supabase.from('property_nearby_places').insert(rows)
  if (error) return { added: 0 }

  revalidateProperty(propertyId)
  return { added: rows.length }
}

export async function removeNearbyPlace(
  placeId: string,
  propertyId: string,
): Promise<{ error?: string; success?: boolean }> {
  const owned = await getOwnedProperty(propertyId)
  if (!owned) return { error: 'Imóvel não encontrado.' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('property_nearby_places')
    .delete()
    .eq('id', placeId)
    .eq('property_id', propertyId)

  if (error) return { error: 'Não foi possível remover o ponto.' }
  revalidateProperty(propertyId)
  return { success: true }
}

export async function listNearbyPlaces(propertyId: string): Promise<NearbyPlace[]> {
  const owned = await getOwnedProperty(propertyId)
  if (!owned) return []

  const supabase = await createClient()
  const { data } = await supabase
    .from('property_nearby_places')
    .select('id, name, category, distance_m, latitude, longitude, source, position')
    .eq('property_id', propertyId)
    .order('category')
    .order('distance_m', { nullsFirst: false })

  return (data ?? []) as NearbyPlace[]
}
