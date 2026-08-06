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
    <div className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6">
      <div className="grid gap-10 md:grid-cols-2 md:items-center">
        <div>
          <span className="rounded-full bg-[var(--brand)]/10 px-3 py-1 text-sm font-medium text-[var(--brand)]">
            Sobre nós
          </span>
          <h1 className="site-heading mt-4 text-3xl font-bold tracking-tight text-foreground text-balance md:text-4xl">
            {site.organization.name}
          </h1>
          <div className="mt-6 whitespace-pre-line text-lg leading-relaxed text-muted-foreground">{about}</div>
        </div>
        {site.settings.aboutImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={site.settings.aboutImageUrl || '/placeholder.svg'}
            alt={`Sobre a ${site.organization.name}`}
            className="aspect-[4/3] w-full rounded-2xl border border-border object-cover"
          />
        ) : null}
      </div>
    </div>
  )
}
