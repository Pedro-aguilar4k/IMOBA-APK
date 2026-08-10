'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { LoaderCircle, MapPinned, Plus, Sparkles, Trash2, X } from 'lucide-react'
import {
  addNearbyPlace,
  importNearbyPlaces,
  removeNearbyPlace,
  suggestNearbyPlaces,
} from '@/app/(app)/dashboard/corretor/properties/nearby-actions'
import {
  NEARBY_CATEGORIES,
  categoryLabel,
  formatDistance,
  type NearbyPlace,
  type NearbySuggestion,
} from '@/lib/nearby-places'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Field, FieldLabel } from '@/components/ui/field'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface NearbyPlacesEditorProps {
  propertyId: string
  hasCoords: boolean
  places: NearbyPlace[]
}

export function NearbyPlacesEditor({ propertyId, hasCoords, places }: NearbyPlacesEditorProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [suggestions, setSuggestions] = useState<NearbySuggestion[]>([])
  const [searching, setSearching] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)
  const [name, setName] = useState('')
  const [category, setCategory] = useState(NEARBY_CATEGORIES[0].value)
  const [distance, setDistance] = useState('')

  const refresh = () => startTransition(() => router.refresh())

  async function handleSearch() {
    setSearching(true)
    setMessage(null)
    const result = await suggestNearbyPlaces(propertyId)
    setSearching(false)
    if (result.error) {
      setMessage({ type: 'error', text: result.error })
      return
    }
    setSuggestions(result.suggestions ?? [])
  }

  async function handleImportAll() {
    const result = await importNearbyPlaces(propertyId, suggestions)
    if (result.error) {
      setMessage({ type: 'error', text: result.error })
      return
    }
    setSuggestions([])
    setMessage({ type: 'success', text: `${result.added} ponto(s) adicionado(s).` })
    refresh()
  }

  async function handleAddSuggestion(suggestion: NearbySuggestion) {
    const result = await addNearbyPlace(propertyId, { ...suggestion, source: 'mapbox' })
    if (result.error) {
      setMessage({ type: 'error', text: result.error })
      return
    }
    setSuggestions((current) => current.filter((s) => s !== suggestion))
    refresh()
  }

  async function handleAddManual() {
    if (!name.trim()) {
      setMessage({ type: 'error', text: 'Informe o nome do ponto.' })
      return
    }
    const result = await addNearbyPlace(propertyId, {
      name,
      category,
      distance_m: distance ? Number(distance) : null,
      source: 'manual',
    })
    if (result.error) {
      setMessage({ type: 'error', text: result.error })
      return
    }
    setName('')
    setDistance('')
    setMessage({ type: 'success', text: 'Ponto adicionado.' })
    refresh()
  }

  async function handleRemove(placeId: string) {
    const result = await removeNearbyPlace(placeId, propertyId)
    if (result.error) {
      setMessage({ type: 'error', text: result.error })
      return
    }
    refresh()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPinned className="size-5 text-primary" aria-hidden="true" />O que tem por perto
        </CardTitle>
        <CardDescription>
          Busque automaticamente pontos próximos (mercado, farmácia, escola...) ou adicione manualmente.
          Eles aparecem na página pública do imóvel.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" variant="outline" onClick={handleSearch} disabled={searching || !hasCoords}>
            {searching ? (
              <LoaderCircle data-icon="inline-start" className="animate-spin" />
            ) : (
              <Sparkles data-icon="inline-start" />
            )}
            Buscar automaticamente
          </Button>
          {!hasCoords ? (
            <span className="text-sm text-muted-foreground">
              Cadastre latitude e longitude do imóvel para habilitar a busca automática.
            </span>
          ) : null}
        </div>

        {message ? (
          <p
            role="status"
            className={message.type === 'error' ? 'text-sm text-destructive' : 'text-sm text-primary'}
          >
            {message.text}
          </p>
        ) : null}

        {suggestions.length ? (
          <div className="rounded-xl border border-border bg-muted/30 p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium">Sugestões do Mapbox ({suggestions.length})</p>
              <div className="flex gap-2">
                <Button type="button" size="sm" onClick={handleImportAll}>
                  Adicionar todos
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => setSuggestions([])}>
                  <X data-icon="inline-start" />
                  Descartar
                </Button>
              </div>
            </div>
            <ul className="mt-3 flex flex-col gap-2">
              {suggestions.map((suggestion, index) => (
                <li
                  key={`${suggestion.name}-${index}`}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{suggestion.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {categoryLabel(suggestion.category)} · {formatDistance(suggestion.distance_m)}
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    aria-label={`Adicionar ${suggestion.name}`}
                    onClick={() => handleAddSuggestion(suggestion)}
                  >
                    <Plus />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="grid gap-3 rounded-xl border border-border p-4 sm:grid-cols-[1fr_10rem_8rem_auto] sm:items-end">
          <Field>
            <FieldLabel htmlFor="nearby-name">Nome do ponto</FieldLabel>
            <Input
              id="nearby-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Supermercado Central"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="nearby-category">Categoria</FieldLabel>
            <Select value={category} onValueChange={(value) => setCategory(value ?? NEARBY_CATEGORIES[0].value)}>
              <SelectTrigger id="nearby-category" className="w-full">
                <SelectValue>{(value) => categoryLabel(value as string)}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {NEARBY_CATEGORIES.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="nearby-distance">Distância (m)</FieldLabel>
            <Input
              id="nearby-distance"
              type="number"
              min="0"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              placeholder="100"
            />
          </Field>
          <Button type="button" onClick={handleAddManual} disabled={pending}>
            <Plus data-icon="inline-start" />
            Adicionar
          </Button>
        </div>

        {places.length ? (
          <ul className="flex flex-col gap-2">
            {places.map((place) => (
              <li
                key={place.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <Badge variant="secondary">{categoryLabel(place.category)}</Badge>
                  <span className="truncate text-sm font-medium">{place.name}</span>
                  {place.distance_m != null ? (
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatDistance(place.distance_m)}
                    </span>
                  ) : null}
                </div>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  aria-label={`Remover ${place.name}`}
                  onClick={() => handleRemove(place.id)}
                >
                  <Trash2 />
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">Nenhum ponto próximo cadastrado ainda.</p>
        )}
      </CardContent>
    </Card>
  )
}
