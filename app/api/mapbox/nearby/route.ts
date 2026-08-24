import { NextResponse } from 'next/server'
import type { NearbyCategory, NearbyPoint } from '@/lib/nearby-points'

const SEARCHES: Record<Exclude<NearbyCategory, 'outro'>, string> = {
  escola: 'escola',
  mercado: 'supermercado',
  saude: 'hospital farmácia',
  transporte: 'estação transporte público',
  parque: 'parque',
  restaurante: 'restaurante',
}

function distanceInMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const radius = 6_371_000
  const toRadians = (value: number) => (value * Math.PI) / 180
  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2
  return 2 * radius * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const latitude = Number(searchParams.get('lat'))
  const longitude = Number(searchParams.get('lng'))

  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90 || !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    return NextResponse.json({ error: 'Coordenadas inválidas.' }, { status: 400 })
  }

  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
  if (!token) return NextResponse.json({ points: [] })

  try {
    const results = await Promise.all(
      Object.entries(SEARCHES).map(async ([category, query]) => {
        const url = new URL('https://api.mapbox.com/search/searchbox/v1/forward')
        url.searchParams.set('access_token', token)
        url.searchParams.set('q', query)
        url.searchParams.set('proximity', `${longitude},${latitude}`)
        url.searchParams.set('origin', `${longitude},${latitude}`)
        url.searchParams.set('types', 'poi')
        url.searchParams.set('language', 'pt')
        url.searchParams.set('limit', '5')
        const response = await fetch(url, { next: { revalidate: 3600 } })
        if (!response.ok) return []
        const data = (await response.json()) as { features?: Array<{ id: string; geometry?: { coordinates?: [number, number] }; properties?: { name?: string; full_address?: string; coordinates?: { longitude?: number; latitude?: number } } }> }
        return (data.features ?? []).flatMap((feature): NearbyPoint[] => {
          const lng = feature.properties?.coordinates?.longitude ?? feature.geometry?.coordinates?.[0]
          const lat = feature.properties?.coordinates?.latitude ?? feature.geometry?.coordinates?.[1]
          if (lng == null || lat == null) return []
          const distance = Math.round(distanceInMeters(latitude, longitude, lat, lng))
          if (distance > 5000) return []
          return [{ id: `mapbox-${category}-${lat.toFixed(6)}-${lng.toFixed(6)}`, name: feature.properties?.name ?? feature.properties?.full_address ?? 'Ponto próximo', category: category as NearbyCategory, latitude: lat, longitude: lng, distance, source: 'automatic' }]
        })
      }),
    )

    const unique = new Map<string, NearbyPoint>()
    for (const point of results.flat()) {
      const key = `${point.name.toLowerCase()}-${point.latitude.toFixed(4)}-${point.longitude.toFixed(4)}`
      if (!unique.has(key)) unique.set(key, point)
    }
    return NextResponse.json({ points: [...unique.values()].sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0)).slice(0, 18) })
  } catch {
    return NextResponse.json({ points: [] })
  }
}
