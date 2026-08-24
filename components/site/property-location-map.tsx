'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import useSWR from 'swr'
import 'mapbox-gl/dist/mapbox-gl.css'
import { LoaderCircle, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { NEARBY_CATEGORIES, type NearbyCategory, type NearbyPoint } from '@/lib/nearby-points'

interface Props { latitude: number; longitude: number; title: string; customPoints: NearbyPoint[] }

const fetcher = (url: string) => fetch(url).then((response) => response.json() as Promise<{ points: NearbyPoint[] }>)
const markerColors: Record<NearbyCategory, string> = { escola: '#2563eb', mercado: '#16a34a', saude: '#dc2626', transporte: '#7c3aed', parque: '#15803d', restaurante: '#ea580c', outro: '#475569' }

function distanceLabel(distance?: number) { return distance == null ? 'Adicionado pelo corretor' : distance < 1000 ? `${distance} m` : `${(distance / 1000).toFixed(1).replace('.', ',')} km` }

export function PropertyLocationMap({ latitude, longitude, title, customPoints }: Props) {
  const { data, isLoading } = useSWR(`/api/mapbox/nearby?lat=${latitude}&lng=${longitude}`, fetcher, { revalidateOnFocus: false })
  const [category, setCategory] = useState<NearbyCategory | 'todos'>('todos')
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])
  const points = useMemo(() => [...customPoints, ...(data?.points ?? [])], [customPoints, data])
  const visible = category === 'todos' ? points : points.filter((point) => point.category === category)

  useEffect(() => {
    if (!containerRef.current || mapRef.current || !process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN) return
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
    const map = new mapboxgl.Map({ container: containerRef.current, style: 'mapbox://styles/mapbox/streets-v12', center: [longitude, latitude], zoom: 14 })
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right')
    new mapboxgl.Marker({ color: '#0f172a', scale: 1.2 }).setLngLat([longitude, latitude]).setPopup(new mapboxgl.Popup({ offset: 24 }).setText(title)).addTo(map)
    mapRef.current = map
    return () => { markersRef.current.forEach((marker) => marker.remove()); map.remove(); mapRef.current = null }
  }, [latitude, longitude, title])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current = visible.map((point) => new mapboxgl.Marker({ color: markerColors[point.category], scale: point.source === 'custom' ? 0.9 : 0.75 }).setLngLat([point.longitude, point.latitude]).setPopup(new mapboxgl.Popup({ offset: 20 }).setHTML(`<strong>${point.name.replace(/[<>&"']/g, '')}</strong><br>${NEARBY_CATEGORIES[point.category]}`)).addTo(map))
  }, [visible])

  const focusPoint = (point: NearbyPoint) => {
    mapRef.current?.flyTo({ center: [point.longitude, point.latitude], zoom: 16, essential: true })
    markersRef.current.find((marker) => marker.getLngLat().lat === point.latitude && marker.getLngLat().lng === point.longitude)?.togglePopup()
  }

  if (!process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN) return <div className="rounded-2xl bg-muted p-8 text-center text-sm text-muted-foreground">O mapa está temporariamente indisponível.</div>

  return <section className="mt-10" aria-labelledby="location-heading"><div className="flex flex-col gap-1"><h2 id="location-heading" className="font-display text-xl font-semibold text-foreground">Localização e pontos próximos</h2><p className="text-sm leading-relaxed text-muted-foreground">Explore serviços e lugares úteis próximos ao imóvel.</p></div><div className="mt-5 overflow-hidden rounded-2xl border border-border bg-card"><div ref={containerRef} className="h-80 w-full sm:h-96" aria-label={`Mapa da localização de ${title}`} /><div className="flex flex-col gap-4 p-4 sm:p-5"><div className="flex gap-2 overflow-x-auto pb-1" aria-label="Filtrar pontos por categoria"><Button type="button" size="sm" variant={category === 'todos' ? 'default' : 'outline'} onClick={() => setCategory('todos')}>Todos</Button>{Object.entries(NEARBY_CATEGORIES).filter(([key]) => key !== 'outro').map(([key, label]) => <Button key={key} type="button" size="sm" variant={category === key ? 'default' : 'outline'} onClick={() => setCategory(key as NearbyCategory)}>{label}</Button>)}</div>{isLoading ? <p className="flex items-center gap-2 text-sm text-muted-foreground"><LoaderCircle className="size-4 animate-spin" />Buscando pontos próximos...</p> : visible.length ? <ul className="grid gap-2 sm:grid-cols-2">{visible.slice(0, 10).map((point) => <li key={point.id}><button type="button" onClick={() => focusPoint(point)} className="flex w-full items-center gap-3 rounded-xl border border-border p-3 text-left transition-colors hover:bg-muted"><span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted"><MapPin className="size-4" style={{ color: markerColors[point.category] }} /></span><span className="min-w-0"><span className="block truncate text-sm font-medium text-foreground">{point.name}</span><span className="block text-xs text-muted-foreground">{NEARBY_CATEGORIES[point.category]} · {distanceLabel(point.distance)}</span></span></button></li>)}</ul> : <p className="text-sm text-muted-foreground">Nenhum ponto encontrado nesta categoria.</p>}</div></div></section>
}
