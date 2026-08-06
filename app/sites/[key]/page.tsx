import Link from 'next/link'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { ArrowRight, MessageCircle } from 'lucide-react'
import { getSiteByKey, getSiteProperties } from '@/lib/sites/site-data'
import { PropertyCard } from '@/components/sites/property-card'
import { buildWhatsappLink } from '@/lib/sites/format'

export async function generateMetadata({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params
  const site = await getSiteByKey(key)
  if (!site) return { title: 'Site não encontrado' }
  return {
    title: `${site.organization.name} — Imóveis`,
    description: site.settings.heroSubtitle ?? `Imóveis disponíveis na ${site.organization.name}`,
  }
}

export default async function SiteHomePage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params
  const site = await getSiteByKey(key)
  if (!site) notFound()

  const basePath = (await headers()).get('x-site-key') ? '' : `/sites/${key}`
  const properties = await getSiteProperties(site.organization.id)
  const featured = properties.slice(0, 6)
  const whatsapp = buildWhatsappLink(site.settings.whatsapp, `Olá! Vim pelo site da ${site.organization.name}.`)

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundColor: 'var(--brand)' }}
          aria-hidden
        />
        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-20 sm:px-6 md:py-28">
          <span className="w-fit rounded-full border border-[var(--brand)]/30 bg-[var(--brand)]/10 px-3 py-1 text-sm font-medium text-[var(--brand)]">
            {site.organization.name}
          </span>
          <h1 className="max-w-2xl text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            {site.settings.heroTitle ?? 'Encontre seu próximo imóvel'}
          </h1>
          <p className="max-w-xl text-pretty text-lg text-muted-foreground">
            {site.settings.heroSubtitle ?? `Imóveis selecionados pela ${site.organization.name}.`}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={`${basePath}/imoveis`}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--brand)] px-5 py-3 font-semibold text-white transition-opacity hover:opacity-90"
            >
              Ver imóveis <ArrowRight className="size-4" />
            </Link>
            {whatsapp ? (
              <a
                href={whatsapp}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-5 py-3 font-semibold text-foreground transition-colors hover:bg-muted"
              >
                <MessageCircle className="size-4" /> WhatsApp
              </a>
            ) : null}
          </div>
        </div>
      </section>

      {/* Destaques */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Imóveis em destaque</h2>
            <p className="mt-1 text-muted-foreground">Confira as melhores oportunidades disponíveis.</p>
          </div>
          <Link
            href={`${basePath}/imoveis`}
            className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-[var(--brand)] hover:underline sm:flex"
          >
            Ver todos <ArrowRight className="size-4" />
          </Link>
        </div>

        {featured.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((property) => (
              <PropertyCard key={property.id} property={property} basePath={basePath} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-12 text-center text-muted-foreground">
            Nenhum imóvel disponível no momento.
          </div>
        )}
      </section>
    </>
  )
}
