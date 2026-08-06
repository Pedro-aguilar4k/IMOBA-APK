import Link from 'next/link'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { ArrowLeft, Bath, BedDouble, Car, Maximize, MapPin, MessageCircle } from 'lucide-react'
import { getSiteByKey, getSitePropertyDetail } from '@/lib/sites/site-data'
import { ContactForm } from '@/components/sites/contact-form'
import { PropertyGallery } from '@/components/sites/property-gallery'
import { getPropertyTypeLabel } from '@/lib/properties'
import { buildWhatsappLink, formatBRLFromCents } from '@/lib/sites/format'

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`

export async function generateMetadata({ params }: { params: Promise<{ key: string; id: string }> }) {
  const { key, id } = await params
  const site = await getSiteByKey(key)
  if (!site) return { title: 'Imóvel' }
  const detail = await getSitePropertyDetail(site.organization.id, id)
  if (!detail) return { title: 'Imóvel' }
  return {
    title: `${detail.property.title} — ${site.organization.name}`,
    description: detail.property.description?.slice(0, 150) ?? undefined,
  }
}

export default async function SitePropertyDetailPage({
  params,
}: {
  params: Promise<{ key: string; id: string }>
}) {
  const { key, id } = await params
  const site = await getSiteByKey(key)
  if (!site) notFound()

  const detail = await getSitePropertyDetail(site.organization.id, id)
  if (!detail) notFound()

  const { property, media } = detail
  const basePath = (await headers()).get('x-site-key') ? '' : `/sites/${key}`
  const location = [property.neighborhood, property.city, property.state].filter(Boolean).join(', ')
  const rent = formatBRLFromCents(property.rent_value)
  const condo = formatBRLFromCents(property.condominium_value)
  const iptu = formatBRLFromCents(property.iptu_value)
  const whatsapp = buildWhatsappLink(
    site.settings.whatsapp,
    `Olá! Tenho interesse no imóvel "${property.title}" (${basePath || ''}/imoveis/${property.id}).`,
  )

  const specs = [
    property.bedrooms
      ? { icon: BedDouble, label: plural(property.bedrooms, 'quarto', 'quartos') }
      : null,
    property.bathrooms
      ? { icon: Bath, label: plural(property.bathrooms, 'banheiro', 'banheiros') }
      : null,
    property.parking_spaces
      ? { icon: Car, label: plural(property.parking_spaces, 'vaga', 'vagas') }
      : null,
    property.usable_area_sqm ?? property.area_sqm
      ? { icon: Maximize, label: `${property.usable_area_sqm ?? property.area_sqm} m²` }
      : null,
  ].filter(Boolean) as { icon: typeof BedDouble; label: string }[]

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <Link
        href={`${basePath}/imoveis`}
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Voltar aos imóveis
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <div className="flex flex-col gap-8">
          <PropertyGallery images={media} title={property.title} />

          <div>
            {property.property_type ? (
              <span className="mb-2 inline-block rounded-full bg-[var(--brand)]/10 px-3 py-1 text-xs font-semibold text-[var(--brand)]">
                {getPropertyTypeLabel(property.property_type)}
              </span>
            ) : null}
            <h1 className="text-3xl font-bold tracking-tight text-foreground text-balance">
              {property.title}
            </h1>
            {location ? (
              <p className="mt-2 flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="size-4" /> {location}
              </p>
            ) : null}
          </div>

          {specs.length ? (
            <div className="flex flex-wrap gap-6 rounded-2xl border border-border bg-card p-5">
              {specs.map((spec) => (
                <div key={spec.label} className="flex items-center gap-2 text-foreground">
                  <spec.icon className="size-5 text-[var(--brand)]" />
                  <span className="text-sm font-medium">{spec.label}</span>
                </div>
              ))}
            </div>
          ) : null}

          {property.description ? (
            <div>
              <h2 className="mb-2 text-xl font-semibold text-foreground">Descrição</h2>
              <p className="whitespace-pre-line leading-relaxed text-muted-foreground">
                {property.description}
              </p>
            </div>
          ) : null}
        </div>

        {/* Sidebar de valores + contato */}
        <aside className="flex flex-col gap-6 lg:sticky lg:top-24 lg:h-fit">
          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">Valor do aluguel</p>
            <p className="mt-1 text-3xl font-bold text-[var(--brand)]">{rent ?? 'Sob consulta'}</p>
            <dl className="mt-4 flex flex-col gap-2 border-t border-border pt-4 text-sm">
              {condo ? (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Condomínio</dt>
                  <dd className="font-medium text-foreground">{condo}</dd>
                </div>
              ) : null}
              {iptu ? (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">IPTU</dt>
                  <dd className="font-medium text-foreground">{iptu}</dd>
                </div>
              ) : null}
            </dl>
            {whatsapp ? (
              <a
                href={whatsapp}
                target="_blank"
                rel="noreferrer"
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--brand)] px-4 py-3 font-semibold text-white transition-opacity hover:opacity-90"
              >
                <MessageCircle className="size-4" /> Falar no WhatsApp
              </a>
            ) : null}
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">Tenho interesse</h2>
            <ContactForm siteKey={key} propertyId={property.id} compact />
          </div>
        </aside>
      </div>
    </div>
  )
}
