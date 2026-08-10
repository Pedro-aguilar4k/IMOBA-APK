import { ArrowLeft, Bath, BedDouble, Car, MapPin, Ruler } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { LeadForm } from '@/components/site/lead-form'
import { PropertyGallery } from '@/components/site/property-gallery'
import { PropertyNearby } from '@/components/site/property-nearby'
import { VisitTracker } from '@/components/site/visit-tracker'
import { Badge } from '@/components/ui/badge'
import { formatBRL, formatBRLShort, propertyTypeLabel, purposeBadge } from '@/lib/site/format'
import { getOrganizationBySlug, getPropertyNearbyPlaces, getPublicProperty } from '@/lib/site/site-data'

interface DetailPageProps {
  params: Promise<{ slug: string; id: string }>
}

export async function generateMetadata({ params }: DetailPageProps) {
  const { slug, id } = await params
  const org = await getOrganizationBySlug(slug)
  if (!org) return {}
  const property = await getPublicProperty(org.id, id)
  if (!property) return {}
  return { title: `${property.title} | ${org.name}` }
}

export default async function DetailPage({ params }: DetailPageProps) {
  const { slug, id } = await params
  const org = await getOrganizationBySlug(slug)
  if (!org) notFound()
  const property = await getPublicProperty(org.id, id)
  if (!property) notFound()
  const nearbyPlaces = await getPropertyNearbyPlaces(org.id, id)

  const isSale = property.listing_purpose === 'venda'
  const price = isSale ? formatBRLShort(property.sale_value) : formatBRL(property.rent_value)
  const location = [property.neighborhood, property.city, property.state].filter(Boolean).join(', ')

  const specs = [
    property.bedrooms != null && { icon: BedDouble, label: `${property.bedrooms} quartos` },
    property.bathrooms != null && { icon: Bath, label: `${property.bathrooms} banheiros` },
    property.parking_spaces > 0 && { icon: Car, label: `${property.parking_spaces} vagas` },
    property.usable_area_sqm != null && {
      icon: Ruler,
      label: `${property.usable_area_sqm} m²`,
    },
  ].filter(Boolean) as { icon: typeof Bath; label: string }[]

  return (
    <div className="bg-background">
      <VisitTracker organizationId={org.id} path={`/site/${slug}/imoveis/${id}`} />

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <Link
          href={`/site/${slug}/imoveis`}
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Voltar para a busca
        </Link>
      </div>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 pb-16 sm:px-6 lg:grid-cols-[1.6fr_1fr] lg:px-8">
        <div>
          <PropertyGallery images={property.images} title={property.title} />

          <div className="mt-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-primary text-primary-foreground">
                {purposeBadge(property.listing_purpose)}
              </Badge>
              <Badge variant="secondary">{propertyTypeLabel(property.property_type)}</Badge>
            </div>
            <h1 className="mt-3 font-display text-2xl font-semibold tracking-tight text-foreground text-balance sm:text-3xl">
              {property.title}
            </h1>
            {location && (
              <p className="mt-2 flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="size-4 shrink-0 text-primary" aria-hidden="true" />
                {location}
              </p>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              {specs.map((spec) => {
                const Icon = spec.icon
                return (
                  <div
                    key={spec.label}
                    className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground"
                  >
                    <Icon className="size-4 text-primary" aria-hidden="true" />
                    {spec.label}
                  </div>
                )
              })}
            </div>

            {property.description && (
              <div className="mt-8">
                <h2 className="font-display text-lg font-semibold text-foreground">
                  Sobre o imóvel
                </h2>
                <p className="mt-3 whitespace-pre-line text-muted-foreground leading-relaxed">
                  {property.description}
                </p>
              </div>
            )}

            <PropertyNearby
              title={property.title}
              latitude={property.latitude}
              longitude={property.longitude}
              places={nearbyPlaces}
            />
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <p className="text-sm text-muted-foreground">
              {property.listing_purpose === 'aluguel' ? 'Valor do aluguel' : 'Valor'}
            </p>
            <p className="mt-1 font-display text-3xl font-semibold text-foreground">
              {price}
              {!isSale && <span className="text-base font-normal text-muted-foreground">/mês</span>}
            </p>
            <div className="mt-6 border-t border-border pt-6">
              <h2 className="font-display text-lg font-semibold text-foreground">
                Fale com um corretor
              </h2>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                Agende uma visita ou tire suas dúvidas sobre este imóvel.
              </p>
              <div className="mt-4">
                <LeadForm
                  organizationId={org.id}
                  defaultMessage={`Olá! Tenho interesse no imóvel "${property.title}". Podem me passar mais informações?`}
                />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
