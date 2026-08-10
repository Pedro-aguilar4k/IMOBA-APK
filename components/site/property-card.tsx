import { Bath, BedDouble, Car, MapPin, Ruler } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { formatBRL, formatBRLShort, propertyTypeLabel, purposeBadge } from '@/lib/site/format'
import type { SiteProperty } from '@/lib/site/site-data'

export function PropertyCard({ property, baseHref }: { property: SiteProperty; baseHref: string }) {
  const isSale = property.listing_purpose === 'venda'
  const priceCents = isSale ? property.sale_value : property.rent_value
  const price = isSale ? formatBRLShort(priceCents) : formatBRL(priceCents)

  return (
    <Link
      href={`${baseHref}/imoveis/${property.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {property.cover_url ? (
          <Image
            src={property.cover_url || "/placeholder.svg"}
            alt={property.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground">Sem foto</div>
        )}
        <Badge className="absolute left-3 top-3 bg-primary text-primary-foreground shadow-sm">
          {purposeBadge(property.listing_purpose)}
        </Badge>
        <span className="absolute right-3 top-3 rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium text-foreground shadow-sm">
          {propertyTypeLabel(property.property_type)}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <p className="font-display text-lg font-semibold text-foreground">
            {price}
            {!isSale && <span className="text-sm font-normal text-muted-foreground">/mês</span>}
          </p>
          <h3 className="mt-0.5 line-clamp-1 font-medium text-foreground">{property.title}</h3>
        </div>

        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="size-4 shrink-0 text-primary" aria-hidden="true" />
          <span className="line-clamp-1">
            {[property.neighborhood, property.city].filter(Boolean).join(', ')}
          </span>
        </p>

        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-border/60 pt-3 text-sm text-muted-foreground">
          {property.bedrooms != null && (
            <span className="flex items-center gap-1.5">
              <BedDouble className="size-4" aria-hidden="true" />
              {property.bedrooms}
            </span>
          )}
          {property.bathrooms != null && (
            <span className="flex items-center gap-1.5">
              <Bath className="size-4" aria-hidden="true" />
              {property.bathrooms}
            </span>
          )}
          {property.parking_spaces > 0 && (
            <span className="flex items-center gap-1.5">
              <Car className="size-4" aria-hidden="true" />
              {property.parking_spaces}
            </span>
          )}
          {property.usable_area_sqm != null && (
            <span className="flex items-center gap-1.5">
              <Ruler className="size-4" aria-hidden="true" />
              {property.usable_area_sqm} m²
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
