'use client'

import { Bath, BedDouble, Car, MapPin, Ruler, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { PropertyCard } from '@/components/site/property-card'
import { PropertyMap } from '@/components/site/property-map'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatBRL, formatBRLShort, propertyTypeLabel, purposeBadge } from '@/lib/site/format'
import { cn } from '@/lib/utils'
import type { SiteProperty } from '@/lib/site/site-data'

function priceLabel(property: SiteProperty) {
  const isSale = property.listing_purpose === 'venda'
  const cents = isSale ? property.sale_value : property.rent_value
  return isSale ? formatBRLShort(cents) : `${formatBRL(cents)}/mês`
}

export function PropertyResults({ properties, baseHref }: { properties: SiteProperty[]; baseHref: string }) {
  const [selectedId, setSelectedId] = useState<string>()
  const [panelOpen, setPanelOpen] = useState(false)
  const selected = properties.find((property) => property.id === selectedId)

  function handleSelect(property: SiteProperty) {
    setSelectedId(property.id)
    setPanelOpen(true)
  }

  const showPanel = panelOpen && selected

  return (
    <div className="mt-6">
      <div className="flex flex-col gap-4 lg:flex-row">
        <div
          className={cn(
            'h-[18rem] overflow-hidden rounded-2xl border border-border bg-muted shadow-sm transition-all sm:h-[22rem] lg:h-[26rem]',
            showPanel ? 'lg:flex-1' : 'w-full',
          )}
        >
          <PropertyMap properties={properties} selectedId={selectedId} onSelect={handleSelect} />
        </div>

        {showPanel ? (
          <aside className="w-full shrink-0 overflow-hidden rounded-2xl border border-border bg-card shadow-sm lg:h-[26rem] lg:w-[22rem]">
            <div className="flex h-full flex-col overflow-y-auto">
              <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-muted">
                {selected.cover_url ? (
                  <Image
                    src={selected.cover_url || '/placeholder.svg'}
                    alt={selected.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 22rem"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center text-sm text-muted-foreground">
                    Sem foto
                  </div>
                )}
                <Badge className="absolute left-4 top-4 bg-primary text-primary-foreground shadow-sm">
                  {purposeBadge(selected.listing_purpose)}
                </Badge>
                <button
                  type="button"
                  onClick={() => setPanelOpen(false)}
                  aria-label="Fechar detalhes"
                  className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm transition-colors hover:bg-background"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              </div>

              <div className="flex flex-col gap-2 px-5 pt-5">
                <p className="font-display text-2xl font-semibold text-foreground">{priceLabel(selected)}</p>
                <h3 className="text-lg font-semibold leading-snug text-pretty text-foreground">{selected.title}</h3>
                <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="size-4 shrink-0 text-primary" aria-hidden="true" />
                  <span>{[selected.neighborhood, selected.city].filter(Boolean).join(', ')}</span>
                </p>
              </div>

              <div className="px-5 py-4">
                <span className="inline-flex rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground">
                  {propertyTypeLabel(selected.property_type)}
                </span>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  {selected.bedrooms != null && (
                    <div className="flex items-center gap-2 rounded-lg border border-border/70 px-3 py-2.5 text-sm text-foreground">
                      <BedDouble className="size-4 text-primary" aria-hidden="true" />
                      {selected.bedrooms} {selected.bedrooms === 1 ? 'quarto' : 'quartos'}
                    </div>
                  )}
                  {selected.bathrooms != null && (
                    <div className="flex items-center gap-2 rounded-lg border border-border/70 px-3 py-2.5 text-sm text-foreground">
                      <Bath className="size-4 text-primary" aria-hidden="true" />
                      {selected.bathrooms} {selected.bathrooms === 1 ? 'banheiro' : 'banheiros'}
                    </div>
                  )}
                  {selected.parking_spaces > 0 && (
                    <div className="flex items-center gap-2 rounded-lg border border-border/70 px-3 py-2.5 text-sm text-foreground">
                      <Car className="size-4 text-primary" aria-hidden="true" />
                      {selected.parking_spaces} {selected.parking_spaces === 1 ? 'vaga' : 'vagas'}
                    </div>
                  )}
                  {selected.usable_area_sqm != null && (
                    <div className="flex items-center gap-2 rounded-lg border border-border/70 px-3 py-2.5 text-sm text-foreground">
                      <Ruler className="size-4 text-primary" aria-hidden="true" />
                      {selected.usable_area_sqm} m²
                    </div>
                  )}
                </div>

                {selected.description ? (
                  <p className="mt-4 line-clamp-4 text-sm leading-relaxed text-muted-foreground">
                    {selected.description}
                  </p>
                ) : null}
              </div>

              <div className="mt-auto border-t border-border p-5">
                <Button
                  className="h-11 w-full rounded-full"
                  render={<Link href={`${baseHref}/imoveis/${selected.id}`} />}
                >
                  Ver mais
                </Button>
              </div>
            </div>
          </aside>
        ) : null}
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {properties.map((property) => (
          <div
            key={property.id}
            onMouseEnter={() => setSelectedId(property.id)}
            onFocus={() => setSelectedId(property.id)}
          >
            <PropertyCard property={property} baseHref={baseHref} />
          </div>
        ))}
      </div>
    </div>
  )
}
