'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import MapboxDraw from '@mapbox/mapbox-gl-draw'
import 'mapbox-gl/dist/mapbox-gl.css'
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'
import { MapPin, Trash2, Undo2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { extractPolygon, formatArea, polygonAreaSqm, polygonBounds, type GeoJSONPolygon } from '@/lib/geo'

interface BoundaryDrawerProps {
  /** GeoJSON inicial (Feature/Polygon) já salvo para o imóvel. */
  initial?: unknown
  /** Coordenadas para centralizar o mapa quando não há polígono. */
  latitude?: number | null
  longitude?: number | null
}

export function BoundaryDrawer({ initial, latitude, longitude }: BoundaryDrawerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const drawRef = useRef<MapboxDraw | null>(null)
  const initialPolygon = useRef<GeoJSONPolygon | null>(extractPolygon(initial))
  const [geojson, setGeojson] = useState<string>(
    initialPolygon.current ? JSON.stringify(initialPolygon.current) : '',
  )
  const [areaSqm, setAreaSqm] = useState<number>(
    initialPolygon.current ? polygonAreaSqm(initialPolygon.current) : 0,
  )

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
    if (!token) return
    mapboxgl.accessToken = token

    const start = initialPolygon.current
    const center: [number, number] = start
      ? (polygonBounds(start)
          ? [
              (polygonBounds(start)![0] + polygonBounds(start)![2]) / 2,
              (polygonBounds(start)![1] + polygonBounds(start)![3]) / 2,
            ]
          : [-47.3344, -15.5372])
      : [longitude ?? -47.3344, latitude ?? -15.5372]

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center,
      zoom: start ? 14 : longitude != null ? 15 : 5,
    })
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right')

    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: { polygon: true, trash: true },
    })
    map.addControl(draw, 'top-left')
    mapRef.current = map
    drawRef.current = draw

    const recompute = () => {
      const all = draw.getAll()
      const polygon = all.features.length ? extractPolygon(all.features[all.features.length - 1]) : null
      if (polygon) {
        setGeojson(JSON.stringify(polygon))
        setAreaSqm(polygonAreaSqm(polygon))
      } else {
        setGeojson('')
        setAreaSqm(0)
      }
    }

    map.on('load', () => {
      if (start) {
        const ids = draw.add({ type: 'Feature', geometry: start, properties: {} })
        void ids
        const bounds = polygonBounds(start)
        if (bounds) map.fitBounds(bounds as [number, number, number, number], { padding: 60, duration: 0 })
      }
    })

    // Mantém apenas o último polígono desenhado.
    map.on('draw.create', () => {
      const all = draw.getAll()
      if (all.features.length > 1) {
        all.features.slice(0, -1).forEach((f) => f.id && draw.delete(String(f.id)))
      }
      recompute()
    })
    map.on('draw.update', recompute)
    map.on('draw.delete', recompute)

    return () => {
      map.remove()
      mapRef.current = null
      drawRef.current = null
    }
  }, [latitude, longitude])

  const clear = () => {
    drawRef.current?.deleteAll()
    setGeojson('')
    setAreaSqm(0)
  }

  const startDrawing = () => {
    drawRef.current?.changeMode('draw_polygon')
  }

  const area = formatArea(areaSqm)
  const hasToken = Boolean(process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN)

  return (
    <div className="flex flex-col gap-3">
      <input type="hidden" name="boundary" value={geojson} />

      {hasToken ? (
        <div ref={containerRef} className="h-96 w-full overflow-hidden rounded-xl border border-border" aria-label="Mapa para demarcar a área do imóvel" />
      ) : (
        <div className="flex h-96 items-center justify-center rounded-xl border border-dashed border-border bg-muted p-8 text-center text-sm text-muted-foreground">
          Configure o token do Mapbox para desenhar a área.
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={startDrawing}>
            <MapPin data-icon="inline-start" />
            Desenhar área
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={clear} disabled={!geojson}>
            <Trash2 data-icon="inline-start" />
            Limpar
          </Button>
        </div>
        {areaSqm > 0 ? (
          <p className="text-sm text-muted-foreground">
            Área demarcada:{' '}
            <span className="font-semibold text-foreground">{area.hectares}</span>{' '}
            <span aria-hidden="true">·</span> {area.alqueires} <span aria-hidden="true">·</span> {area.sqm}
          </p>
        ) : (
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Undo2 className="size-3.5" aria-hidden="true" />
            Clique em &quot;Desenhar área&quot; e marque os cantos do terreno no mapa.
          </p>
        )}
      </div>
    </div>
  )
}
