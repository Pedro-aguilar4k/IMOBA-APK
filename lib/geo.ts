export type GeoJSONPolygon = {
  type: 'Polygon'
  coordinates: number[][][]
}

export type GeoJSONFeature = {
  type: 'Feature'
  geometry: GeoJSONPolygon
  properties?: Record<string, unknown>
}

const EARTH_RADIUS = 6378137 // metros (WGS84)

const rad = (deg: number) => (deg * Math.PI) / 180

/**
 * Área geodésica de um anel de coordenadas [lng, lat] em metros quadrados,
 * usando a fórmula do excesso esférico (mesma abordagem do @turf/area).
 */
function ringArea(coords: number[][]): number {
  const len = coords.length
  if (len < 3) return 0

  let total = 0
  for (let i = 0; i < len; i++) {
    const lower = coords[(i - 1 + len) % len]
    const middle = coords[i]
    const upper = coords[(i + 1) % len]
    total += (rad(upper[0]) - rad(lower[0])) * Math.sin(rad(middle[1]))
  }
  return (total * EARTH_RADIUS * EARTH_RADIUS) / 2
}

/** Área absoluta (m²) de um polígono GeoJSON (considera apenas o anel externo). */
export function polygonAreaSqm(polygon: GeoJSONPolygon | null | undefined): number {
  if (!polygon || polygon.type !== 'Polygon' || !polygon.coordinates?.length) return 0
  return Math.abs(ringArea(polygon.coordinates[0]))
}

/** Extrai o primeiro polígono de um GeoJSON (Feature, FeatureCollection ou Polygon). */
export function extractPolygon(input: unknown): GeoJSONPolygon | null {
  if (!input || typeof input !== 'object') return null
  const obj = input as Record<string, unknown>

  if (obj.type === 'Polygon' && Array.isArray(obj.coordinates)) {
    return obj as unknown as GeoJSONPolygon
  }
  if (obj.type === 'Feature') {
    return extractPolygon((obj as unknown as GeoJSONFeature).geometry)
  }
  if (obj.type === 'FeatureCollection' && Array.isArray(obj.features)) {
    for (const feature of obj.features as GeoJSONFeature[]) {
      const polygon = extractPolygon(feature)
      if (polygon) return polygon
    }
  }
  return null
}

/** Centro aproximado (média dos vértices) de um polígono. */
export function polygonCenter(polygon: GeoJSONPolygon): [number, number] | null {
  const ring = polygon.coordinates?.[0]
  if (!ring?.length) return null
  let lng = 0
  let lat = 0
  const count = ring.length
  for (const [x, y] of ring) {
    lng += x
    lat += y
  }
  return [lng / count, lat / count]
}

/** Bounding box [minLng, minLat, maxLng, maxLat] de um polígono. */
export function polygonBounds(polygon: GeoJSONPolygon): [number, number, number, number] | null {
  const ring = polygon.coordinates?.[0]
  if (!ring?.length) return null
  let minLng = Infinity
  let minLat = Infinity
  let maxLng = -Infinity
  let maxLat = -Infinity
  for (const [x, y] of ring) {
    if (x < minLng) minLng = x
    if (y < minLat) minLat = y
    if (x > maxLng) maxLng = x
    if (y > maxLat) maxLat = y
  }
  return [minLng, minLat, maxLng, maxLat]
}

const HECTARE_SQM = 10000
const ALQUEIRE_PAULISTA_SQM = 24200

const numberFormat = (digits: number) =>
  new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: digits })

/** Formata a área calculada em m², hectares e alqueires. */
export function formatArea(sqm: number): {
  sqm: string
  hectares: string
  alqueires: string
} {
  return {
    sqm: `${numberFormat(0).format(Math.round(sqm))} m²`,
    hectares: `${numberFormat(2).format(sqm / HECTARE_SQM)} ha`,
    alqueires: `${numberFormat(2).format(sqm / ALQUEIRE_PAULISTA_SQM)} alq.`,
  }
}
