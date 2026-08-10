'use client'

import { Bath, BedDouble, Car, MapPin, Ruler } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { PropertyCard } from '@/components/site/property-card'
import { PropertyMap } from '@/components/site/property-map'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { formatBRL, formatBRLShort, propertyTypeLabel, purposeBadge } from '@/lib/site/format'
import type { SiteProperty } from '@/lib/site/site-data'

function priceLabel(property: SiteProperty) {
  const isSale = property.listing_purpose === 'venda'
  const cents = isSale ? property.sale_value : property.rent_value
  return isSale ? formatBRLShort(cents) : `${formatBRL(cents)}/mês`
}

export function PropertyResults({ properties, baseHref }: { properties: SiteProperty[]; baseHref: string }) {
  const [selectedId, setSelectedId] = useState<string>()
  const [open, setOpen] = useState(false)
  const selected = properties.find((property) => property.id === selectedId)

  function handleSelect(property: SiteProperty) {
    setSelectedId(property.id)
    setOpen(true)
  }

  return (
    <div className="mt-6">
      <div className="h-[24rem] overflow-hidden rounded-2xl border border-border bg-muted shadow-sm sm:h-[32rem] lg:h-[36rem]">
        <PropertyMap properties={properties} selectedId={selectedId} onSelect={handleSelect} />
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

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full gap-0 overflow-y-auto p-0 sm:max-w-md">
          {selected ? (
            <>
              <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-muted">
                {selected.cover_url ? (
                  <Image
                    src={selected.cover_url || '/placeholder.svg'}
                    alt={selected.title}
                    fill
                    sizes="(max-width: 640px) 100vw, 28rem"
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
              </div>

              <SheetHeader className="gap-2 px-6 pt-6">
                <p className="font-display text-2xl font-semibold text-foreground">
                  {priceLabel(selected)}
                </p>
                <SheetTitle className="text-lg leading-snug text-pretty">{selected.title}</SheetTitle>
                <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="size-4 shrink-0 text-primary" aria-hidden="true" />
                  <span>{[selected.neighborhood, selected.city].filter(Boolean).join(', ')}</span>
                </p>
              </SheetHeader>

              <div className="px-6 py-4">
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
                  <p className="mt-4 line-clamp-4 text-sm text-muted-foreground leading-relaxed">
                    {selected.description}
                  </p>
                ) : null}
              </div>

              <div className="mt-auto border-t border-border p-6">
                <Button
                  className="h-11 w-full rounded-full"
                  render={<Link href={`${baseHref}/imoveis/${selected.id}`} />}
                >
                  Ver mais
                </Button>
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  )
}
