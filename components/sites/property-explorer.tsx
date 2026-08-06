'use client'

import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { PropertyCard } from '@/components/sites/property-card'
import { Input } from '@/components/ui/input'
import { getPropertyTypeLabel } from '@/lib/properties'
import type { SitePropertyCard } from '@/lib/sites/site-data'

const BEDROOM_OPTIONS = [
  { value: 'any', label: 'Quartos' },
  { value: '1', label: '1+' },
  { value: '2', label: '2+' },
  { value: '3', label: '3+' },
  { value: '4', label: '4+' },
]

export function PropertyExplorer({
  properties,
  basePath,
}: {
  properties: SitePropertyCard[]
  basePath: string
}) {
  const [query, setQuery] = useState('')
  const [type, setType] = useState('any')
  const [bedrooms, setBedrooms] = useState('any')

  const types = useMemo(() => {
    const set = new Set(properties.map((p) => p.propertyType).filter(Boolean) as string[])
    return Array.from(set)
  }, [properties])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return properties.filter((p) => {
      if (type !== 'any' && p.propertyType !== type) return false
      if (bedrooms !== 'any' && (p.bedrooms ?? 0) < Number(bedrooms)) return false
      if (q) {
        const haystack = [p.title, p.city, p.neighborhood].filter(Boolean).join(' ').toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
  }, [properties, query, type, bedrooms])

  const selectClass =
    'h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]'

  return (
    <div className="flex flex-col gap-8">
      {/* Filtros */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por título, bairro ou cidade"
            className="pl-9"
          />
        </div>
        <select value={type} onChange={(e) => setType(e.target.value)} className={selectClass} aria-label="Tipo de imóvel">
          <option value="any">Tipo</option>
          {types.map((t) => (
            <option key={t} value={t}>
              {getPropertyTypeLabel(t)}
            </option>
          ))}
        </select>
        <select
          value={bedrooms}
          onChange={(e) => setBedrooms(e.target.value)}
          className={selectClass}
          aria-label="Quartos"
        >
          {BEDROOM_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <p className="text-sm text-muted-foreground">
        {filtered.length} {filtered.length === 1 ? 'imóvel encontrado' : 'imóveis encontrados'}
      </p>

      {filtered.length ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((property) => (
            <PropertyCard key={property.id} property={property} basePath={basePath} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-12 text-center text-muted-foreground">
          Nenhum imóvel encontrado com esses filtros.
        </div>
      )}
    </div>
  )
}
