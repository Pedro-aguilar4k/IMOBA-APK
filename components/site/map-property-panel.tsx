'use client'

import { useEffect, useState } from 'react'
import { ArrowRight, Bath, BedDouble, Car, ChevronLeft, ChevronRight, MapPin, Ruler, X } from 'lucide-react'
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
  const [activeImage, setActiveImage] = useState(0)
  const images = property.images.length > 0 ? property.images : property.cover_url ? [property.cover_url] : []
  const isSale = property.listing_purpose === 'venda'
  const priceCents = isSale ? property.sale_value : property.rent_value
  const price = isSale ? formatBRLShort(priceCents) : formatBRL(priceCents)

  useEffect(() => {
    setActiveImage(0)
  }, [property.id])

  function showPreviousImage() {
    setActiveImage((current) => (current - 1 + images.length) % images.length)
  }

  function showNextImage() {
    setActiveImage((current) => (current + 1) % images.length)
  }

  return (
    <article className="flex h-full min-h-[28rem] animate-in flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm fade-in slide-in-from-right-2 duration-300 motion-reduce:animate-none">
      <div className="relative aspect-[16/9] overflow-hidden bg-muted lg:h-64 lg:shrink-0">
        {images[activeImage] ? (
          <Image src={images[activeImage]} alt={`${property.title} — foto ${activeImage + 1}`} fill sizes="(max-width: 1024px) 100vw, 352px" className="object-cover" />
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
          <X aria-hidden="true" />
        </button>

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={showPreviousImage}
              className="absolute left-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm transition hover:bg-background"
              aria-label="Ver foto anterior"
            >
              <ChevronLeft aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={showNextImage}
              className="absolute right-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm transition hover:bg-background"
              aria-label="Ver próxima foto"
            >
              <ChevronRight aria-hidden="true" />
            </button>
            <span className="absolute bottom-3 right-3 rounded-full bg-foreground/75 px-2.5 py-1 text-xs font-medium text-background" aria-live="polite">
              {activeImage + 1} / {images.length}
            </span>
          </>
        )}
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
            <MapPin className="shrink-0 text-primary" aria-hidden="true" />
            <span className="line-clamp-1">{[property.neighborhood, property.city].filter(Boolean).join(', ')}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 border-y border-border/60 py-3 text-sm text-muted-foreground">
          {property.bedrooms != null && <span className="flex items-center gap-1.5"><BedDouble aria-hidden="true" />{property.bedrooms}</span>}
          {property.bathrooms != null && <span className="flex items-center gap-1.5"><Bath aria-hidden="true" />{property.bathrooms}</span>}
          {property.parking_spaces > 0 && <span className="flex items-center gap-1.5"><Car aria-hidden="true" />{property.parking_spaces}</span>}
          {property.usable_area_sqm != null && <span className="flex items-center gap-1.5"><Ruler aria-hidden="true" />{property.usable_area_sqm} m²</span>}
        </div>

        {property.description && (
          <section aria-labelledby={`property-about-${property.id}`}>
            <h3 id={`property-about-${property.id}`} className="font-display text-sm font-semibold text-foreground">Sobre o imóvel</h3>
            <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{property.description}</p>
          </section>
        )}

        <Link href={`${baseHref}/imoveis/${property.id}`} className="mt-auto flex items-center justify-between rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90">
          Ver detalhes do imóvel
          <ArrowRight aria-hidden="true" />
        </Link>
      </div>
    </article>
  )
}
