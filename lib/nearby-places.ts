export interface NearbyCategory {
  value: string
  label: string
  /** Canonical Mapbox Search Box category ids to query. */
  mapbox: string[]
}

export const NEARBY_CATEGORIES: NearbyCategory[] = [
  { value: 'mercado', label: 'Mercado', mapbox: ['grocery'] },
  { value: 'farmacia', label: 'Farmácia', mapbox: ['pharmacy'] },
  { value: 'escola', label: 'Escola', mapbox: ['school'] },
  { value: 'hospital', label: 'Hospital', mapbox: ['hospital'] },
  { value: 'transporte', label: 'Transporte', mapbox: ['bus_station', 'train_station'] },
  { value: 'restaurante', label: 'Restaurante', mapbox: ['restaurant'] },
  { value: 'parque', label: 'Parque', mapbox: ['park'] },
  { value: 'banco', label: 'Banco', mapbox: ['bank'] },
]

const CATEGORY_LABELS = new Map(NEARBY_CATEGORIES.map((c) => [c.value, c.label]))

export function categoryLabel(value: string): string {
  return CATEGORY_LABELS.get(value) ?? value
}

export function isNearbyCategory(value: string): boolean {
  return CATEGORY_LABELS.has(value)
}

export interface NearbyPlace {
  id: string
  name: string
  category: string
  distance_m: number | null
  latitude: number | null
  longitude: number | null
  source: 'mapbox' | 'manual'
  position: number
}

export interface NearbySuggestion {
  name: string
  category: string
  distance_m: number
  latitude: number
  longitude: number
}

/** Distância em metros entre dois pontos (fórmula de Haversine). */
export function haversineMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return Math.round(2 * R * Math.asin(Math.sqrt(a)))
}

export function formatDistance(meters: number | null): string {
  if (meters == null) return ''
  if (meters < 1000) return `${meters} m`
  return `${(meters / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} km`
}

interface MapboxFeature {
  properties?: { name?: string; coordinates?: { latitude?: number; longitude?: number } }
  geometry?: { coordinates?: [number, number] }
}

/** Busca POIs próximos por categoria usando a Search Box API do Mapbox. */
export async function fetchMapboxNearby(
  lat: number,
  lng: number,
  perCategory = 3,
): Promise<NearbySuggestion[]> {
  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
  if (!token) return []

  const results: NearbySuggestion[] = []

  for (const category of NEARBY_CATEGORIES) {
    const seen = new Set<string>()
    const collected: NearbySuggestion[] = []

    for (const canonical of category.mapbox) {
      const url = new URL(`https://api.mapbox.com/search/searchbox/v1/category/${canonical}`)
      url.searchParams.set('access_token', token)
      url.searchParams.set('proximity', `${lng},${lat}`)
      url.searchParams.set('limit', '10')
      url.searchParams.set('language', 'pt')

      try {
        const res = await fetch(url, { cache: 'no-store' })
        if (!res.ok) continue
        const data = (await res.json()) as { features?: MapboxFeature[] }

        for (const feature of data.features ?? []) {
          const coords =
            feature.geometry?.coordinates ??
            (feature.properties?.coordinates
              ? [feature.properties.coordinates.longitude, feature.properties.coordinates.latitude]
              : undefined)
          const name = feature.properties?.name
          if (!coords || coords[0] == null || coords[1] == null || !name) continue
          const key = name.toLowerCase()
          if (seen.has(key)) continue
          seen.add(key)
          collected.push({
            name,
            category: category.value,
            latitude: coords[1] as number,
            longitude: coords[0] as number,
            distance_m: haversineMeters(lat, lng, coords[1] as number, coords[0] as number),
          })
        }
      } catch {
        // Ignora falhas de categoria individual e segue para a próxima.
      }
    }

    collected.sort((a, b) => a.distance_m - b.distance_m)
    results.push(...collected.slice(0, perCategory))
  }

  return results
}
