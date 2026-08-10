'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import {
  Banknote,
  Bus,
  Cross,
  GraduationCap,
  MapPin,
  ShoppingCart,
  Trees,
  Utensils,
} from 'lucide-react'
import { categoryLabel, formatDistance } from '@/lib/nearby-places'
import type { SiteNearbyPlace } from '@/lib/site/site-data'

interface PropertyNearbyProps {
  title: string
  latitude: number | null
  longitude: number | null
  places: SiteNearbyPlace[]
}

const CATEGORY_ICONS: Record<string, typeof MapPin> = {
  mercado: ShoppingCart,
  farmacia: Cross,
  escola: GraduationCap,
  hospital: Cross,
  transporte: Bus,
  restaurante: Utensils,
  parque: Trees,
  banco: Banknote,
}

function iconFor(category: string) {
  return CATEGORY_ICONS[category] ?? MapPin
}

export function PropertyNearby({ title, latitude, longitude, places }: PropertyNearbyProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const hasCoords = latitude != null && longitude != null
  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

  const grouped = useMemo(() => {
    const map = new Map<string, SiteNearbyPlace[]>()
    for (const place of places) {
      const list = map.get(place.category) ?? []
      list.push(place)
      map.set(place.category, list)
    }
    return Array.from(map.entries())
  }, [places])

  useEffect(() => {
    if (!containerRef.current || mapRef.current || !hasCoords || !token) return

    mapboxgl.accessToken = token
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [longitude!, latitude!],
      zoom: 15,
      attributionControl: true,
    })
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right')
    mapRef.current = map

    const property = document.createElement('div')
    property.className = 'nearby-home-marker'
    new mapboxgl.Marker({ element: property, anchor: 'bottom' })
      .setLngLat([longitude!, latitude!])
      .setPopup(new mapboxgl.Popup({ offset: 24 }).setText(title))
      .addTo(map)

    const bounds = new mapboxgl.LngLatBounds()
    bounds.extend([longitude!, latitude!])

    for (const place of places) {
      if (place.latitude == null || place.longitude == null) continue
      const el = document.createElement('button')
      el.type = 'button'
      el.className = 'nearby-poi-marker'
      el.setAttribute('aria-label', place.name)
      el.onmouseenter = () => setActiveId(place.id)
      el.onmouseleave = () => setActiveId(null)
      new mapboxgl.Marker({ element: el, anchor: 'center' })
        .setLngLat([place.longitude, place.latitude])
        .setPopup(
          new mapboxgl.Popup({ offset: 16, closeButton: false }).setText(
            `${place.name} · ${formatDistance(place.distance_m)}`,
          ),
        )
        .addTo(map)
      bounds.extend([place.longitude, place.latitude])
    }

    if (places.some((p) => p.latitude != null && p.longitude != null)) {
      map.fitBounds(bounds, { padding: 64, maxZoom: 16, duration: 0 })
    }

    return () => {
      map.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!places.length && !hasCoords) return null

  return (
    <section className="mt-10">
      <h2 className="font-display text-lg font-semibold text-foreground">Localização e o que tem por perto</h2>
      <div className="mt-4 flex flex-col gap-6">
        {hasCoords && token ? (
          <div
            ref={containerRef}
            className="h-80 w-full overflow-hidden rounded-2xl border border-border md:h-96"
            aria-label={`Mapa da localização de ${title}`}
          />
        ) : (
          <div className="flex h-80 items-center justify-center rounded-2xl border border-border bg-muted p-8 text-center text-sm text-muted-foreground">
            Localização no mapa indisponível para este imóvel.
          </div>
        )}

        <div>
          {places.length ? (
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {grouped.map(([category, items]) => {
                const Icon = iconFor(category)
                return (
                  <li key={category} className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <Icon className="size-4 text-primary" aria-hidden="true" />
                      {categoryLabel(category)}
                    </div>
                    <ul className="mt-2 flex flex-col gap-1.5">
                      {items.map((place) => (
                        <li
                          key={place.id}
                          className={`flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-sm transition-colors ${
                            activeId === place.id ? 'bg-muted' : ''
                          }`}
                        >
                          <span className="truncate text-foreground">{place.name}</span>
                          {place.distance_m != null ? (
                            <span className="shrink-0 font-medium text-muted-foreground">
                              {formatDistance(place.distance_m)}
                            </span>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              Nenhum ponto de interesse cadastrado para este imóvel ainda.
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
