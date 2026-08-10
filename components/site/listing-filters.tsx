'use client'

import { Search, SlidersHorizontal } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const PURPOSE_OPTIONS = [
  { value: 'all', label: 'Comprar e alugar' },
  { value: 'venda', label: 'Comprar' },
  { value: 'aluguel', label: 'Alugar' },
]

const TYPE_OPTIONS = [
  { value: 'all', label: 'Todos os tipos' },
  { value: 'apartment', label: 'Apartamento' },
  { value: 'house', label: 'Casa' },
  { value: 'commercial', label: 'Comercial' },
  { value: 'land', label: 'Terreno' },
  { value: 'farm', label: 'Fazenda' },
  { value: 'ranch', label: 'Sítio' },
  { value: 'chacara', label: 'Chácara' },
]

const BEDROOM_OPTIONS = [
  { value: 'all', label: 'Qualquer' },
  { value: '1', label: '1+' },
  { value: '2', label: '2+' },
  { value: '3', label: '3+' },
  { value: '4', label: '4+' },
]

interface ListingFiltersProps {
  slug: string
  initial: {
    q?: string
    purpose?: string
    type?: string
    bedrooms?: string
    minArea?: string
    maxArea?: string
    neighborhood?: string
  }
}

export function ListingFilters({ slug, initial }: ListingFiltersProps) {
  const router = useRouter()
  const [q, setQ] = useState(initial.q ?? '')
  const [purpose, setPurpose] = useState(initial.purpose ?? 'all')
  const [type, setType] = useState(initial.type ?? 'all')
  const [bedrooms, setBedrooms] = useState(initial.bedrooms ?? 'all')
  const [minArea, setMinArea] = useState(initial.minArea ?? '')
  const [maxArea, setMaxArea] = useState(initial.maxArea ?? '')
  const [neighborhood, setNeighborhood] = useState(initial.neighborhood ?? '')

  function apply() {
    const params = new URLSearchParams()
    if (q.trim()) params.set('q', q.trim())
    if (purpose !== 'all') params.set('purpose', purpose)
    if (type !== 'all') params.set('type', type)
    if (bedrooms !== 'all') params.set('bedrooms', bedrooms)
    if (minArea.trim()) params.set('minArea', minArea.trim())
    if (maxArea.trim()) params.set('maxArea', maxArea.trim())
    if (neighborhood.trim()) params.set('neighborhood', neighborhood.trim())
    const query = params.toString()
    router.push(`/site/${slug}/imoveis${query ? `?${query}` : ''}`)
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex items-center gap-2 text-sm font-medium text-foreground">
        <SlidersHorizontal className="size-4 text-primary" aria-hidden="true" />
        Filtrar imóveis
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 lg:items-end">
        <div className="grid gap-1.5 lg:col-span-2">
          <Label htmlFor="q">Busca</Label>
          <Input
            id="q"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229) apply()
            }}
            placeholder="Bairro, cidade ou título"
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="neighborhood-filter">Bairro</Label>
          <Input id="neighborhood-filter" value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} placeholder="Ex.: Centro" />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="min-area">Área mínima (m²)</Label>
          <Input id="min-area" type="number" min="0" value={minArea} onChange={(e) => setMinArea(e.target.value)} placeholder="60" />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="max-area">Área máxima (m²)</Label>
          <Input id="max-area" type="number" min="0" value={maxArea} onChange={(e) => setMaxArea(e.target.value)} placeholder="180" />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="purpose-filter">Finalidade</Label>
          <Select value={purpose} onValueChange={(value) => setPurpose(value ?? 'all')}>
            <SelectTrigger id="purpose-filter">
              <SelectValue>
                {(value) => PURPOSE_OPTIONS.find((o) => o.value === value)?.label ?? 'Comprar e alugar'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {PURPOSE_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="type-filter">Tipo</Label>
          <Select value={type} onValueChange={(value) => setType(value ?? 'all')}>
            <SelectTrigger id="type-filter">
              <SelectValue>
                {(value) => TYPE_OPTIONS.find((o) => o.value === value)?.label ?? 'Todos os tipos'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {TYPE_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="bedrooms-filter">Quartos</Label>
          <Select value={bedrooms} onValueChange={(value) => setBedrooms(value ?? 'all')}>
            <SelectTrigger id="bedrooms-filter">
              <SelectValue>
                {(value) => BEDROOM_OPTIONS.find((o) => o.value === value)?.label ?? 'Qualquer'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {BEDROOM_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button onClick={apply} className="mt-4 h-11 w-full gap-2 rounded-full md:w-auto md:px-8">
        <Search className="size-4" aria-hidden="true" />
        Aplicar filtros
      </Button>
    </div>
  )
}
