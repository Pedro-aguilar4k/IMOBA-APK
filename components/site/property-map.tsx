'use client'

import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
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
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
    if (!token) return

    mapboxgl.accessToken = token
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-46.6333, -23.5505],
      zoom: 11,
      // Trava o afastamento no nível de cidade e limita a aproximação.
      minZoom: 10.5,
      maxZoom: 17,
      attributionControl: true,
    })
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right')
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

    const bounds = new mapboxgl.LngLatBounds()
    located.forEach((property) => {
      const element = document.createElement('button')
      element.type = 'button'
      const markerTone = property.listing_purpose === 'aluguel' ? ' is-rent' : property.property_type === 'house' ? ' is-house' : ' is-sale'
      element.className = `property-price-marker${markerTone}${property.id === selectedId ? ' is-selected' : ''}`
      element.textContent = priceLabel(property)
      element.setAttribute('aria-label', `${priceLabel(property)} — ${property.title}`)
      element.onclick = () => onSelect?.(property)

      const marker = new mapboxgl.Marker({ element, anchor: 'bottom' })
        .setLngLat([property.longitude!, property.latitude!])
        .addTo(map)
      marker.getElement().title = `${propertyTypeLabel(property.property_type)}: ${property.title}`
      markersRef.current.push(marker)
      bounds.extend([property.longitude!, property.latitude!])
    })

    if (located.length === 1) map.flyTo({ center: [located[0].longitude!, located[0].latitude!], zoom: 14 })
    else map.fitBounds(bounds, { padding: 72, minZoom: 11.5, maxZoom: 15, duration: 600 })
  }, [properties, selectedId, onSelect])

  if (!process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN) {
    return <div className="flex h-full min-h-96 items-center justify-center bg-muted p-8 text-center text-sm text-muted-foreground">Configure o token público do Mapbox para visualizar o mapa.</div>
  }

  if (!properties.some((property) => property.latitude != null && property.longitude != null)) {
    return <div className="flex h-full min-h-96 items-center justify-center bg-muted p-8 text-center text-sm text-muted-foreground">Os imóveis aparecerão no mapa após a localização ser cadastrada.</div>
  }

  return <div ref={containerRef} className="h-full min-h-96 w-full" aria-label="Mapa dos imóveis" />
}
