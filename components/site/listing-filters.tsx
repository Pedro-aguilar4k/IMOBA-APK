'use client'

import { Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Popover } from '@base-ui/react/popover'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

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
  suggestions?: {
    cities: string[]
    neighborhoods: string[]
  }
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

type SegmentId = 'onde' | 'finalidade' | 'tipo' | 'quartos' | 'area'

const popupClass =
  'z-50 w-[min(20rem,calc(100vw-2rem))] origin-[var(--transform-origin)] rounded-3xl border border-border bg-popover p-5 text-popover-foreground shadow-xl outline-none transition-[transform,opacity] data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0'

export function ListingFilters({ slug, suggestions, initial }: ListingFiltersProps) {
  const router = useRouter()
  const cities = suggestions?.cities ?? []
  const neighborhoods = suggestions?.neighborhoods ?? []
  const [q, setQ] = useState(initial.q ?? '')
  const [neighborhood, setNeighborhood] = useState(initial.neighborhood ?? '')
  const [purpose, setPurpose] = useState(initial.purpose ?? 'all')
  const [type, setType] = useState(initial.type ?? 'all')
  const [bedrooms, setBedrooms] = useState(initial.bedrooms ?? 'all')
  const [minArea, setMinArea] = useState(initial.minArea ?? '')
  const [maxArea, setMaxArea] = useState(initial.maxArea ?? '')
  const [openSegment, setOpenSegment] = useState<SegmentId | null>(null)

  function openState(id: SegmentId) {
    return {
      open: openSegment === id,
      onOpenChange: (next: boolean) => setOpenSegment(next ? id : null),
    }
  }

  function apply(overrides: Partial<Record<'q' | 'neighborhood', string>> = {}, closeAfter = true) {
    const nextQ = (overrides.q ?? q).trim()
    const nextHood = (overrides.neighborhood ?? neighborhood).trim()
    const params = new URLSearchParams()
    if (nextQ) params.set('q', nextQ)
    if (nextHood) params.set('neighborhood', nextHood)
    if (purpose !== 'all') params.set('purpose', purpose)
    if (type !== 'all') params.set('type', type)
    if (bedrooms !== 'all') params.set('bedrooms', bedrooms)
    if (minArea.trim()) params.set('minArea', minArea.trim())
    if (maxArea.trim()) params.set('maxArea', maxArea.trim())
    const query = params.toString()
    if (closeAfter) setOpenSegment(null)
    router.push(`/site/${slug}/imoveis${query ? `?${query}` : ''}`)
  }

  const locationValue = [q.trim(), neighborhood.trim()].filter(Boolean).join(' · ') || 'Qualquer lugar'
  const purposeLabel = PURPOSE_OPTIONS.find((o) => o.value === purpose)?.label ?? 'Comprar e alugar'
  const typeLabel = TYPE_OPTIONS.find((o) => o.value === type)?.label ?? 'Todos os tipos'
  const bedroomsLabel = BEDROOM_OPTIONS.find((o) => o.value === bedrooms)?.label ?? 'Qualquer'
  const areaLabel =
    minArea.trim() || maxArea.trim()
      ? `${minArea.trim() || '0'} – ${maxArea.trim() || '∞'} m²`
      : 'Qualquer'

  return (
    <div className="flex flex-col rounded-3xl border border-border bg-card shadow-sm md:flex-row md:items-stretch md:rounded-full md:py-1 md:pr-2 md:pl-1">
      {/* Onde */}
      <Segment
        label="Onde"
        value={locationValue}
        {...openState('onde')}
        popup={
          <div className="flex flex-col gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="q">Busca livre</Label>
              <Input
                id="q"
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229) apply()
                }}
                placeholder="Cidade ou título"
              />
            </div>

            {cities.length > 0 ? (
              <div className="grid gap-2">
                <span className="text-xs font-medium text-muted-foreground">Cidades disponíveis</span>
                <div className="flex flex-wrap gap-2">
                  {cities.map((city) => (
                    <Chip
                      key={city}
                      active={q.trim().toLowerCase() === city.toLowerCase()}
                      onClick={() => {
                        setQ(city)
                        apply({ q: city })
                      }}
                    >
                      {city}
                    </Chip>
                  ))}
                </div>
              </div>
            ) : null}

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

            {neighborhoods.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {neighborhoods.map((hood) => (
                  <Chip
                    key={hood}
                    active={neighborhood.trim().toLowerCase() === hood.toLowerCase()}
                    onClick={() => {
                      setNeighborhood(hood)
                      apply({ neighborhood: hood })
                    }}
                  >
                    {hood}
                  </Chip>
                ))}
              </div>
            ) : null}
          </div>
        }
      />

      <Divider />

      {/* Finalidade */}
      <Segment
        label="Finalidade"
        value={purposeLabel}
        {...openState('finalidade')}
        popup={
          <OptionList
            options={PURPOSE_OPTIONS}
            selected={purpose}
            onSelect={(value) => {
              setPurpose(value)
              setOpenSegment(null)
            }}
          />
        }
      />

      <Divider />

      {/* Tipo */}
      <Segment
        label="Tipo"
        value={typeLabel}
        {...openState('tipo')}
        popup={
          <OptionList
            options={TYPE_OPTIONS}
            selected={type}
            onSelect={(value) => {
              setType(value)
              setOpenSegment(null)
            }}
          />
        }
      />

      <Divider />

      {/* Quartos */}
      <Segment
        label="Quartos"
        value={bedroomsLabel}
        {...openState('quartos')}
        popup={
          <div className="flex flex-wrap gap-2">
            {BEDROOM_OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => {
                  setBedrooms(o.value)
                  setOpenSegment(null)
                }}
                className={cn(
                  'min-w-12 rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                  bedrooms === o.value
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-foreground hover:border-foreground',
                )}
              >
                {o.label}
              </button>
            ))}
          </div>
        }
      />

      <Divider />

      {/* Área */}
      <Segment
        label="Área"
        value={areaLabel}
        {...openState('area')}
        popup={
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="min-area">Mínima (m²)</Label>
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
                <Label htmlFor="max-area">Máxima (m²)</Label>
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
            <Button type="button" onClick={() => apply()} className="w-full gap-2 rounded-full">
              <Search className="size-4" aria-hidden="true" />
              Ver resultados
            </Button>
          </div>
        }
      />

      {/* Botão de busca */}
      <div className="flex items-center justify-end px-4 py-3 md:px-2 md:py-0">
        <Button
          type="button"
          onClick={() => apply()}
          className="h-12 shrink-0 gap-2 rounded-full px-5 md:size-12 md:px-0"
          aria-label="Buscar imóveis"
        >
          <Search className="size-5" aria-hidden="true" />
          <span className="md:hidden">Buscar</span>
        </Button>
      </div>
    </div>
  )
}

function Divider() {
  return (
    <>
      <span className="mx-2 hidden w-px self-center bg-border md:block md:h-8" aria-hidden="true" />
      <span className="h-px bg-border md:hidden" aria-hidden="true" />
    </>
  )
}

interface SegmentProps {
  label: string
  value: string
  open: boolean
  onOpenChange: (next: boolean) => void
  popup: React.ReactNode
}

function Segment({ label, value, open, onOpenChange, popup }: SegmentProps) {
  return (
    <Popover.Root open={open} onOpenChange={onOpenChange}>
      <Popover.Trigger
        className={cn(
          'flex flex-1 cursor-pointer flex-col justify-center rounded-full px-6 py-3 text-left transition-colors hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          open && 'bg-muted/70',
        )}
      >
        <span className="text-xs font-semibold text-foreground">{label}</span>
        <span className="truncate text-sm text-muted-foreground">{value}</span>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner side="bottom" align="start" sideOffset={12}>
          <Popover.Popup className={popupClass}>{popup}</Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
}

function Chip({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode
  active?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full border px-3 py-1.5 text-sm transition-colors',
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-card text-foreground hover:border-foreground',
      )}
    >
      {children}
    </button>
  )
}

interface OptionListProps {
  options: { value: string; label: string }[]
  selected: string
  onSelect: (value: string) => void
}

function OptionList({ options, selected, onSelect }: OptionListProps) {
  return (
    <div className="flex flex-col gap-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onSelect(o.value)}
          className={cn(
            'flex items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition-colors',
            selected === o.value
              ? 'bg-primary/10 font-medium text-primary'
              : 'text-foreground hover:bg-muted',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
