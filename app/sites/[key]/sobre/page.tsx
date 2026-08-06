import { notFound } from 'next/navigation'
import { getSiteByKey } from '@/lib/sites/site-data'

export async function generateMetadata({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params
  const site = await getSiteByKey(key)
  return { title: site ? `Sobre — ${site.organization.name}` : 'Sobre' }
}

export default async function SiteAboutPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params
  const site = await getSiteByKey(key)
  if (!site) notFound()

  const about =
    site.settings.aboutText ??
    `A ${site.organization.name} conecta pessoas aos melhores imóveis, com atendimento próximo e transparente em cada etapa da negociação.`

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
      <span className="rounded-full bg-[var(--brand)]/10 px-3 py-1 text-sm font-medium text-[var(--brand)]">
        Sobre nós
      </span>
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground text-balance md:text-4xl">
        {site.organization.name}
      </h1>
      <div className="mt-6 whitespace-pre-line text-lg leading-relaxed text-muted-foreground">
        {about}
      </div>
    </div>
  )
}
