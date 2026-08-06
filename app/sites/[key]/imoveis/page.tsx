import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { getSiteByKey, getSiteProperties } from '@/lib/sites/site-data'
import { PropertyExplorer } from '@/components/sites/property-explorer'

export async function generateMetadata({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params
  const site = await getSiteByKey(key)
  return { title: site ? `Imóveis — ${site.organization.name}` : 'Imóveis' }
}

export default async function SitePropertiesPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params
  const site = await getSiteByKey(key)
  if (!site) notFound()

  const basePath = (await headers()).get('x-site-key') ? '' : `/sites/${key}`
  const properties = await getSiteProperties(site.organization.id)

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Imóveis disponíveis</h1>
        <p className="mt-1 text-muted-foreground">
          Explore os imóveis da {site.organization.name} e encontre o ideal para você.
        </p>
      </div>
      <PropertyExplorer properties={properties} basePath={basePath} />
    </div>
  )
}
