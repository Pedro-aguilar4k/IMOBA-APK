import Link from 'next/link'
import { Bath, BedDouble, Car, Maximize, MapPin } from 'lucide-react'
import { formatBRLFromCents } from '@/lib/sites/format'
import { getPropertyTypeLabel } from '@/lib/properties'
import type { SitePropertyCard } from '@/lib/sites/site-data'

export function PropertyCard({ property, basePath }: { property: SitePropertyCard; basePath: string }) {
  const location = [property.neighborhood, property.city].filter(Boolean).join(', ')
  const rent = formatBRLFromCents(property.rentValue)

  return (
    <Link
      href={`${basePath}/imoveis/${property.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {property.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={property.coverUrl || '/placeholder.svg'}
            alt={property.title}
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-sm text-muted-foreground">
            Sem foto
          </div>
        )}
        {property.propertyType ? (
          <span className="absolute left-3 top-3 rounded-full bg-background/90 px-3 py-1 text-xs font-semibold text-foreground backdrop-blur">
            {getPropertyTypeLabel(property.propertyType)}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="line-clamp-1 font-semibold text-foreground">{property.title}</h3>
          {location ? (
            <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="size-3.5 shrink-0" />
              <span className="line-clamp-1">{location}</span>
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          {property.bedrooms ? (
            <span className="flex items-center gap-1">
              <BedDouble className="size-4" /> {property.bedrooms}
            </span>
          ) : null}
          {property.bathrooms ? (
            <span className="flex items-center gap-1">
              <Bath className="size-4" /> {property.bathrooms}
            </span>
          ) : null}
          {property.parkingSpaces ? (
            <span className="flex items-center gap-1">
              <Car className="size-4" /> {property.parkingSpaces}
            </span>
          ) : null}
          {property.areaSqm != null ? (
            <span className="flex items-center gap-1">
              <Maximize className="size-4" /> {property.areaSqm} m²
            </span>
          ) : null}
        </div>

        <div className="mt-auto flex items-baseline gap-1 pt-1">
          {rent ? (
            <>
              <span className="text-lg font-bold text-[var(--brand)]">{rent}</span>
              <span className="text-xs text-muted-foreground">/mês</span>
            </>
          ) : (
            <span className="text-sm font-medium text-muted-foreground">Sob consulta</span>
          )}
        </div>
      </div>
    </Link>
  )
}
