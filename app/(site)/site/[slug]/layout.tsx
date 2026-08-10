import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SiteFooter } from '@/components/site/site-footer'
import { SiteHeader } from '@/components/site/site-header'
import { getOrganizationBySlug } from '@/lib/site/site-data'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const org = await getOrganizationBySlug(slug)
  if (!org) return { title: 'Imobiliária' }
  return {
    title: {
      default: `${org.name} — Imóveis para comprar e alugar`,
      template: `%s | ${org.name}`,
    },
    description:
      org.tagline ?? `Encontre imóveis para comprar e alugar com a ${org.name}.`,
  }
}

export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const org = await getOrganizationBySlug(slug)
  if (!org) notFound()

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <SiteHeader org={org} />
      <main className="flex-1">{children}</main>
      <SiteFooter org={org} />
    </div>
  )
}
