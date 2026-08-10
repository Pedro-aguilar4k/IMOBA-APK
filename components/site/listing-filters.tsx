'use client'

import { Search, SlidersHorizontal, X } from 'lucide-react'
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

const segmentTriggerClass =
  'h-auto w-full flex-col items-start justify-center gap-0.5 rounded-full border-0 bg-transparent px-6 py-3.5 text-left shadow-none transition-colors hover:bg-muted/70 focus-visible:ring-0 data-[size=default]:h-auto [&>svg]:hidden'

export function ListingFilters({ slug, initial }: ListingFiltersProps) {
  const router = useRouter()
  const [q, setQ] = useState(initial.q ?? '')
  const [purpose, setPurpose] = useState(initial.purpose ?? 'all')
  const [type, setType] = useState(initial.type ?? 'all')
  const [bedrooms, setBedrooms] = useState(initial.bedrooms ?? 'all')
  const [minArea, setMinArea] = useState(initial.minArea ?? '')
  const [maxArea, setMaxArea] = useState(initial.maxArea ?? '')
  const [neighborhood, setNeighborhood] = useState(initial.neighborhood ?? '')
  const [showMore, setShowMore] = useState(
    Boolean(initial.minArea || initial.maxArea || initial.neighborhood),
  )

  const advancedCount = [neighborhood.trim(), minArea.trim(), maxArea.trim()].filter(Boolean).length

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
    <div className="flex flex-col gap-3">
      {/* Barra de busca segmentada, estilo Airbnb */}
      <div className="flex flex-col rounded-3xl border border-border bg-card shadow-sm md:flex-row md:items-stretch md:rounded-full md:py-1 md:pr-2 md:pl-1">
        {/* Onde */}
        <label
          htmlFor="q"
          className="flex flex-1 cursor-text flex-col justify-center rounded-full px-6 py-3.5 transition-colors hover:bg-muted/70"
        >
          <span className="text-xs font-semibold text-foreground">Onde</span>
          <Input
            id="q"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229) apply()
            }}
            placeholder="Bairro, cidade ou título"
            className="h-auto border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0 placeholder:text-muted-foreground"
          />
        </label>

        <span className="mx-2 hidden w-px self-center bg-border md:block md:h-8" aria-hidden="true" />
        <span className="h-px bg-border md:hidden" aria-hidden="true" />

        {/* Finalidade */}
        <div className="flex flex-1 flex-col justify-center">
          <Select value={purpose} onValueChange={(value) => setPurpose(value ?? 'all')}>
            <SelectTrigger id="purpose-filter" className={segmentTriggerClass}>
              <span className="text-xs font-semibold text-foreground">Finalidade</span>
              <SelectValue className="text-sm text-muted-foreground">
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

        <span className="mx-2 hidden w-px self-center bg-border md:block md:h-8" aria-hidden="true" />
        <span className="h-px bg-border md:hidden" aria-hidden="true" />

        {/* Tipo */}
        <div className="flex flex-1 flex-col justify-center">
          <Select value={type} onValueChange={(value) => setType(value ?? 'all')}>
            <SelectTrigger id="type-filter" className={segmentTriggerClass}>
              <span className="text-xs font-semibold text-foreground">Tipo</span>
              <SelectValue className="text-sm text-muted-foreground">
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

        <span className="mx-2 hidden w-px self-center bg-border md:block md:h-8" aria-hidden="true" />
        <span className="h-px bg-border md:hidden" aria-hidden="true" />

        {/* Quartos */}
        <div className="flex flex-1 flex-col justify-center">
          <Select value={bedrooms} onValueChange={(value) => setBedrooms(value ?? 'all')}>
            <SelectTrigger id="bedrooms-filter" className={segmentTriggerClass}>
              <span className="text-xs font-semibold text-foreground">Quartos</span>
              <SelectValue className="text-sm text-muted-foreground">
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

        {/* Ações */}
        <div className="flex items-center justify-between gap-2 px-4 py-3 md:justify-center md:px-2 md:py-0">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setShowMore((v) => !v)}
            className="gap-2 rounded-full text-sm text-muted-foreground hover:text-foreground"
            aria-expanded={showMore}
          >
            <SlidersHorizontal className="size-4" aria-hidden="true" />
            <span className="md:hidden">Mais filtros</span>
            {advancedCount > 0 ? (
              <span className="flex size-5 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                {advancedCount}
              </span>
            ) : null}
          </Button>
          <Button
            type="button"
            onClick={apply}
            className="size-12 shrink-0 rounded-full p-0"
            aria-label="Buscar imóveis"
          >
            <Search className="size-5" aria-hidden="true" />
          </Button>
        </div>
      </div>

      {/* Painel de filtros avançados */}
      {showMore ? (
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Mais filtros</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowMore(false)}
              className="gap-1 rounded-full text-muted-foreground"
            >
              <X className="size-4" aria-hidden="true" />
              Fechar
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="grid gap-1.5">
              <Label htmlFor="neighborhood-filter">Bairro</Label>
              <Input
                id="neighborhood-filter"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229) apply()
                }}
                placeholder="Ex.: Centro"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="min-area">Área mínima (m²)</Label>
              <Input
                id="min-area"
                type="number"
                min="0"
                value={minArea}
                onChange={(e) => setMinArea(e.target.value)}
                placeholder="60"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="max-area">Área máxima (m²)</Label>
              <Input
                id="max-area"
                type="number"
                min="0"
                value={maxArea}
                onChange={(e) => setMaxArea(e.target.value)}
                placeholder="180"
              />
            </div>
          </div>
          <Button onClick={apply} className="mt-4 h-11 w-full gap-2 rounded-full sm:w-auto sm:px-8">
            <Search className="size-4" aria-hidden="true" />
            Aplicar filtros
          </Button>
        </div>
      ) : null}
    </div>
  )
}
