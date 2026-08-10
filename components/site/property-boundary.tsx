'use client'

import { useEffect, useMemo, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { Maximize2 } from 'lucide-react'
import { extractPolygon, formatArea, polygonAreaSqm, polygonBounds } from '@/lib/geo'

interface PropertyBoundaryProps {
  title: string
  boundary: unknown
}

export function PropertyBoundary({ title, boundary }: PropertyBoundaryProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const polygon = useMemo(() => extractPolygon(boundary), [boundary])
  const areaSqm = useMemo(() => (polygon ? polygonAreaSqm(polygon) : 0), [polygon])
  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

  useEffect(() => {
    if (!containerRef.current || mapRef.current || !polygon || !token) return
    const bounds = polygonBounds(polygon)
    if (!bounds) return

    mapboxgl.accessToken = token
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      bounds: bounds as [number, number, number, number],
      fitBoundsOptions: { padding: 48 },
      interactive: true,
      attributionControl: true,
    })
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right')
    mapRef.current = map

    map.on('load', () => {
      map.addSource('boundary', {
        type: 'geojson',
        data: { type: 'Feature', geometry: polygon, properties: {} },
      })
      map.addLayer({
        id: 'boundary-fill',
        type: 'fill',
        source: 'boundary',
        paint: { 'fill-color': '#2563eb', 'fill-opacity': 0.25 },
      })
      map.addLayer({
        id: 'boundary-line',
        type: 'line',
        source: 'boundary',
        paint: { 'line-color': '#1d4ed8', 'line-width': 3 },
      })
      map.fitBounds(bounds as [number, number, number, number], { padding: 48, duration: 0 })
    })

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [polygon, token])

  if (!polygon) return null

  const area = formatArea(areaSqm)

  return (
    <section className="mt-8" aria-labelledby="boundary-heading">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="boundary-heading" className="font-display text-lg font-semibold text-foreground">
          Área do imóvel
        </h2>
        {areaSqm > 0 ? (
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Maximize2 className="size-4 text-primary" aria-hidden="true" />
            <span className="font-semibold text-foreground">{area.hectares}</span>
            <span aria-hidden="true">·</span> {area.alqueires}
            <span aria-hidden="true">·</span> {area.sqm}
          </p>
        ) : null}
      </div>

      {token ? (
        <div
          ref={containerRef}
          className="mt-4 h-96 w-full overflow-hidden rounded-2xl border border-border"
          aria-label={`Mapa com a área demarcada de ${title}`}
        />
      ) : (
        <div className="mt-4 flex h-96 items-center justify-center rounded-2xl border border-border bg-muted p-8 text-center text-sm text-muted-foreground">
          Configure o token do Mapbox para visualizar a área demarcada.
        </div>
      )}
    </section>
  )
}
