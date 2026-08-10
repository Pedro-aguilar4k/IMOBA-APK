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
  }
}

export function ListingFilters({ slug, initial }: ListingFiltersProps) {
  const router = useRouter()
  const [q, setQ] = useState(initial.q ?? '')
  const [purpose, setPurpose] = useState(initial.purpose ?? 'all')
  const [type, setType] = useState(initial.type ?? 'all')
  const [bedrooms, setBedrooms] = useState(initial.bedrooms ?? 'all')

  function apply() {
    const params = new URLSearchParams()
    if (q.trim()) params.set('q', q.trim())
    if (purpose !== 'all') params.set('purpose', purpose)
    if (type !== 'all') params.set('type', type)
    if (bedrooms !== 'all') params.set('bedrooms', bedrooms)
    const query = params.toString()
    router.push(`/site/${slug}/imoveis${query ? `?${query}` : ''}`)
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex items-center gap-2 text-sm font-medium text-foreground">
        <SlidersHorizontal className="size-4 text-primary" aria-hidden="true" />
        Filtrar imóveis
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 lg:items-end">
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
          <Label htmlFor="purpose-filter">Finalidade</Label>
          <Select value={purpose} onValueChange={(value) => setPurpose(value ?? 'all')}>
            <SelectTrigger id="purpose-filter">
              <SelectValue />
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
              <SelectValue />
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
              <SelectValue />
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
