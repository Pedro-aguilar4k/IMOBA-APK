import { Home } from 'lucide-react'
import { notFound } from 'next/navigation'
import { ListingFilters } from '@/components/site/listing-filters'
import { PropertyResults } from '@/components/site/property-results'
import { VisitTracker } from '@/components/site/visit-tracker'
import { getOrganizationBySlug, listPublicProperties } from '@/lib/site/site-data'

interface ListingPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ q?: string; purpose?: string; type?: string; bedrooms?: string; minArea?: string; maxArea?: string; neighborhood?: string }>
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const org = await getOrganizationBySlug(slug)
  if (!org) return {}
  return { title: `Imóveis | ${org.name}` }
}

export default async function ListingPage({ params, searchParams }: ListingPageProps) {
  const { slug } = await params
  const sp = await searchParams
  const org = await getOrganizationBySlug(slug)
  if (!org) notFound()

  const purpose =
    sp.purpose === 'venda' || sp.purpose === 'aluguel' || sp.purpose === 'ambos'
      ? sp.purpose
      : 'todos'
  const properties = await listPublicProperties(org.id, {
    q: sp.q,
    purpose,
    type: sp.type,
    neighborhood: sp.neighborhood,
    bedrooms: sp.bedrooms ? Number(sp.bedrooms) : undefined,
    minArea: sp.minArea ? Number(sp.minArea) : undefined,
    maxArea: sp.maxArea ? Number(sp.maxArea) : undefined,
  })

  return (
    <div className="bg-background">
      <VisitTracker organizationId={org.id} path={`/site/${slug}/imoveis`} />

      <div className="border-b border-border bg-muted/40">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground text-balance sm:text-4xl">
            Encontre seu próximo imóvel
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground leading-relaxed">
            Explore o portfólio completo da {org.name}. Use os filtros para chegar mais rápido ao
            imóvel ideal.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <ListingFilters
          slug={slug}
          initial={{ q: sp.q, purpose: sp.purpose, type: sp.type, bedrooms: sp.bedrooms, minArea: sp.minArea, maxArea: sp.maxArea, neighborhood: sp.neighborhood }}
        />

        <p className="mt-6 text-sm text-muted-foreground">
          {properties.length === 0
            ? 'Nenhum imóvel encontrado com esses filtros.'
            : `${properties.length} ${properties.length === 1 ? 'imóvel encontrado' : 'imóveis encontrados'}`}
        </p>

        {properties.length === 0 ? (
          <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
            <Home className="size-8 text-muted-foreground" aria-hidden="true" />
            <p className="font-medium text-foreground">Ajuste os filtros para ver mais opções</p>
            <p className="max-w-sm text-sm text-muted-foreground leading-relaxed">
              Tente ampliar a busca por finalidade, tipo de imóvel ou número de quartos.
            </p>
          </div>
        ) : (
          <PropertyResults properties={properties} baseHref={`/site/${slug}`} />
        )}
      </div>
    </div>
  )
}
