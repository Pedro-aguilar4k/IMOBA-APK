import type { ReactNode } from 'react'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { getSiteByKey } from '@/lib/sites/site-data'
import { SiteHeader } from '@/components/sites/site-header'
import { SiteFooter } from '@/components/sites/site-footer'

/**
 * basePath:
 * - Em host real (subdomínio/domínio) o proxy reescreve para /sites/[key] e injeta
 *   o header x-site-key; nesse caso os links devem ser relativos à raiz ("").
 * - No preview do v0 acessamos /sites/[key] diretamente (sem header), então os links
 *   precisam manter o prefixo /sites/[key].
 */
async function resolveBasePath(key: string) {
  const h = await headers()
  const viaHost = h.get('x-site-key')
  return viaHost ? '' : `/sites/${key}`
}

export default async function SiteLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ key: string }>
}) {
  const { key } = await params
  const site = await getSiteByKey(key)
  if (!site) notFound()

  const basePath = await resolveBasePath(key)

  return (
    <div
      className="flex min-h-svh flex-col bg-background"
      style={{ ['--brand' as string]: site.settings.brandColor }}
    >
      <SiteHeader
        slug={site.organization.slug}
        name={site.organization.name}
        logoUrl={site.settings.logoUrl}
        basePath={basePath}
      />
      <main className="flex-1">{children}</main>
      <SiteFooter
        name={site.organization.name}
        basePath={basePath}
        whatsapp={site.settings.whatsapp}
        phone={site.settings.phone}
        email={site.settings.contactEmail}
        address={site.settings.address}
      />
    </div>
  )
}
