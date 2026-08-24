'use client'

import { useEffect, useRef } from 'react'
import * as maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { formatBRLShort, propertyTypeLabel } from '@/lib/site/format'
import type { SiteProperty } from '@/lib/site/site-data'

interface PropertyMapProps {
  properties: SiteProperty[]
  selectedId?: string
  onSelect?: (property: SiteProperty) => void
}

function priceLabel(property: SiteProperty) {
  const cents = property.listing_purpose === 'venda' ? property.sale_value : property.rent_value
  return property.listing_purpose === 'venda' ? formatBRLShort(cents) : `${formatBRLShort(cents)}/mês`
}

export function PropertyMap({ properties, selectedId, onSelect }: PropertyMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const markersRef = useRef<maplibregl.Marker[]>([])

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '&copy; OpenStreetMap contributors',
          },
        },
        layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
      },
      center: [-47.334, -15.537],
      zoom: 12,
      attributionControl: {},
    })
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')
    mapRef.current = map

    return () => {
      markersRef.current.forEach((marker) => marker.remove())
      markersRef.current = []
      map.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current = []

    const located = properties.filter((property) => property.latitude != null && property.longitude != null)
    if (!located.length) return

    const bounds = new maplibregl.LngLatBounds()
    located.forEach((property) => {
      const element = document.createElement('button')
      element.type = 'button'
      const markerTone = property.listing_purpose === 'aluguel' ? ' is-rent' : property.property_type === 'house' ? ' is-house' : ' is-sale'
      element.className = `property-price-marker${markerTone}${property.id === selectedId ? ' is-selected' : ''}`
      element.textContent = priceLabel(property)
      element.setAttribute('aria-label', `${priceLabel(property)} — ${property.title}`)
      element.onclick = () => onSelect?.(property)

      const marker = new maplibregl.Marker({ element, anchor: 'bottom' })
        .setLngLat([property.longitude!, property.latitude!])
        .addTo(map)
      marker.getElement().title = `${propertyTypeLabel(property.property_type)}: ${property.title}`
      markersRef.current.push(marker)
      bounds.extend([property.longitude!, property.latitude!])
    })

    if (located.length === 1) map.flyTo({ center: [located[0].longitude!, located[0].latitude!], zoom: 14 })
    else map.fitBounds(bounds, { padding: 72, maxZoom: 14, duration: 600 })
  }, [properties, selectedId, onSelect])

  if (!properties.some((property) => property.latitude != null && property.longitude != null)) {
    return <div className="flex h-full min-h-96 items-center justify-center bg-muted p-8 text-center text-sm text-muted-foreground">Os imóveis aparecerão no mapa após a localização ser cadastrada.</div>
  }

  return <div ref={containerRef} className="h-full min-h-96 w-full" aria-label="Mapa dos imóveis" />
}
