'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { MapPin, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { NEARBY_CATEGORIES, type NearbyCategory, type PropertyNearbyPointRecord } from '@/lib/nearby-points'

interface Props { points: PropertyNearbyPointRecord[]; propertyLatitude?: number | null; propertyLongitude?: number | null }

type DraftPoint = Pick<PropertyNearbyPointRecord, 'id' | 'name' | 'category' | 'latitude' | 'longitude'>

export function PropertyNearbyPointsEditor({ points: initialPoints, propertyLatitude, propertyLongitude }: Props) {
  const [points, setPoints] = useState<DraftPoint[]>(initialPoints)
  const [name, setName] = useState('')
  const [category, setCategory] = useState<NearbyCategory>('escola')
  const [latitude, setLatitude] = useState(propertyLatitude ?? -15.7939)
  const [longitude, setLongitude] = useState(propertyLongitude ?? -47.8828)
  const containerRef = useRef<HTMLDivElement>(null)
  const markerRef = useRef<mapboxgl.Marker | null>(null)

  useEffect(() => {
    if (!containerRef.current || !process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN) return
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
    const map = new mapboxgl.Map({ container: containerRef.current, style: 'mapbox://styles/mapbox/streets-v12', center: [longitude, latitude], zoom: 14 })
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right')
    const marker = new mapboxgl.Marker({ color: 'hsl(221 83% 53%)', draggable: true }).setLngLat([longitude, latitude]).addTo(map)
    markerRef.current = marker
    const update = (lng: number, lat: number) => { setLongitude(Number(lng.toFixed(6))); setLatitude(Number(lat.toFixed(6))); marker.setLngLat([lng, lat]) }
    map.on('click', (event) => update(event.lngLat.lng, event.lngLat.lat))
    marker.on('dragend', () => { const position = marker.getLngLat(); update(position.lng, position.lat) })
    return () => { marker.remove(); map.remove(); markerRef.current = null }
    // O mapa é inicializado uma vez; os campos abaixo controlam o marcador selecionado.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const addPoint = () => {
    if (name.trim().length < 2 || !Number.isFinite(latitude) || !Number.isFinite(longitude)) return
    setPoints((current) => [...current, { id: crypto.randomUUID(), name: name.trim(), category, latitude, longitude }])
    setName('')
  }

  return (
    <div className="flex flex-col gap-5">
      <input type="hidden" name="nearbyPoints" value={JSON.stringify(points)} />
      <div ref={containerRef} className="h-64 overflow-hidden rounded-xl border border-border" aria-label="Mapa para selecionar o ponto próximo" />
      <p className="text-sm text-muted-foreground">Clique no mapa ou arraste o marcador para definir a localização do novo ponto.</p>
      <div className="grid gap-3 md:grid-cols-2">
        <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Nome do local" aria-label="Nome do ponto próximo" />
        <Select value={category} onValueChange={(value) => setCategory(value as NearbyCategory)}><SelectTrigger aria-label="Categoria do ponto"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(NEARBY_CATEGORIES).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select>
        <Input type="number" step="any" value={latitude} onChange={(event) => setLatitude(Number(event.target.value))} aria-label="Latitude do ponto" />
        <Input type="number" step="any" value={longitude} onChange={(event) => setLongitude(Number(event.target.value))} aria-label="Longitude do ponto" />
      </div>
      <Button type="button" variant="outline" onClick={addPoint} disabled={name.trim().length < 2}><Plus data-icon="inline-start" />Adicionar ponto</Button>
      {points.length ? <ul className="flex flex-col gap-2">{points.map((point) => <li key={point.id} className="flex items-center justify-between gap-3 rounded-xl border border-border p-3"><div className="flex min-w-0 items-center gap-3"><MapPin className="size-4 shrink-0 text-primary" /><div className="min-w-0"><p className="truncate text-sm font-medium">{point.name}</p><p className="text-xs text-muted-foreground">{NEARBY_CATEGORIES[point.category]}</p></div></div><Button type="button" size="icon-sm" variant="ghost" aria-label={`Remover ${point.name}`} onClick={() => setPoints((current) => current.filter((item) => item.id !== point.id))}><Trash2 /></Button></li>)}</ul> : <p className="rounded-xl bg-muted p-4 text-sm text-muted-foreground">Nenhum ponto personalizado cadastrado.</p>}
    </div>
  )
}
