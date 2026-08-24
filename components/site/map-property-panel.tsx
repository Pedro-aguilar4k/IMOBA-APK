import { ArrowRight, Bath, BedDouble, Car, MapPin, Ruler, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { formatBRL, formatBRLShort, propertyTypeLabel, purposeBadge } from '@/lib/site/format'
import type { SiteProperty } from '@/lib/site/site-data'

interface MapPropertyPanelProps {
  property: SiteProperty
  baseHref: string
  onClose: () => void
}

export function MapPropertyPanel({ property, baseHref, onClose }: MapPropertyPanelProps) {
  const isSale = property.listing_purpose === 'venda'
  const priceCents = isSale ? property.sale_value : property.rent_value
  const price = isSale ? formatBRLShort(priceCents) : formatBRL(priceCents)

  return (
    <article key={property.id} className="flex h-full min-h-[28rem] animate-in flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm fade-in slide-in-from-right-2 duration-300 motion-reduce:animate-none">
      <div className="relative aspect-[16/8] overflow-hidden bg-muted lg:aspect-auto lg:h-56">
        {property.cover_url ? (
          <Image src={property.cover_url} alt={property.title} fill sizes="352px" className="object-cover" />
        ) : (
          <div className="flex size-full items-center justify-center text-sm text-muted-foreground">Sem foto</div>
        )}
        <Badge className="absolute left-3 top-3 bg-primary text-primary-foreground">
          {purposeBadge(property.listing_purpose)}
        </Badge>
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm transition-colors hover:bg-background"
          aria-label="Fechar detalhes do imóvel"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5 lg:p-6">
        <div>
          <div className="flex items-center justify-between gap-3">
            <p className="font-display text-xl font-semibold text-foreground">
              {price}
              {!isSale && <span className="text-sm font-normal text-muted-foreground">/mês</span>}
            </p>
            <span className="text-xs font-medium text-muted-foreground">{propertyTypeLabel(property.property_type)}</span>
          </div>
          <h2 className="mt-1 line-clamp-2 font-medium text-foreground">{property.title}</h2>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-4 shrink-0 text-primary" aria-hidden="true" />
            <span className="line-clamp-1">{[property.neighborhood, property.city].filter(Boolean).join(', ')}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 border-y border-border/60 py-3 text-sm text-muted-foreground">
          {property.bedrooms != null && <span className="flex items-center gap-1.5"><BedDouble className="size-4" aria-hidden="true" />{property.bedrooms}</span>}
          {property.bathrooms != null && <span className="flex items-center gap-1.5"><Bath className="size-4" aria-hidden="true" />{property.bathrooms}</span>}
          {property.parking_spaces > 0 && <span className="flex items-center gap-1.5"><Car className="size-4" aria-hidden="true" />{property.parking_spaces}</span>}
          {property.usable_area_sqm != null && <span className="flex items-center gap-1.5"><Ruler className="size-4" aria-hidden="true" />{property.usable_area_sqm} m²</span>}
        </div>

        <Link href={`${baseHref}/imoveis/${property.id}`} className="mt-auto flex items-center justify-between rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90">
          Ver detalhes do imóvel
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </article>
  )
}
