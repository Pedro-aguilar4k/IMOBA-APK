import type { Metadata } from 'next'
import type { CSSProperties } from 'react'
import { notFound } from 'next/navigation'
import { SiteFooter } from '@/components/site/site-footer'
import { SiteHeader } from '@/components/site/site-header'
import { getOrganizationBySlug, getPublishedSiteCustomization } from '@/lib/site/site-data'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const org = await getOrganizationBySlug(slug)
  if (!org) return { title: 'Imobiliária' }
  const customization = await getPublishedSiteCustomization(org)
  return {
    title: {
      default: customization.seo.title,
      template: `%s | ${customization.brand.displayName}`,
    },
    description: customization.seo.description,
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
  const customization = await getPublishedSiteCustomization(org)

  return (
    <div className="flex min-h-svh flex-col bg-background" style={{ '--site-primary': customization.brand.primaryColor } as CSSProperties}>
      <SiteHeader org={org} customization={customization} />
      <main className="flex-1">{children}</main>
      <SiteFooter org={org} />
    </div>
  )
}
