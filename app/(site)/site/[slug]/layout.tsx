import type { Metadata } from 'next'
import type { CSSProperties } from 'react'
import { notFound } from 'next/navigation'
import { SiteFooter } from '@/components/site/site-footer'
import { SiteHeader } from '@/components/site/site-header'
import { getOrganizationBySlug, getPublishedSiteCustomization } from '@/lib/site/site-data'
import { safeSiteColor } from '@/lib/site/customization'

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

  const defaults = { background: '#ffffff', text: '#172033', muted: '#667085', primary: '#155eef', primaryText: '#ffffff' }
  const theme = customization.theme
  const style = {
    '--site-background': safeSiteColor(theme.pageBackground, defaults.background),
    '--site-text': safeSiteColor(theme.pageText, defaults.text),
    '--site-muted': safeSiteColor(theme.mutedText, defaults.muted),
    '--site-primary': safeSiteColor(theme.primary, defaults.primary),
    '--site-primary-text': safeSiteColor(theme.primaryText, defaults.primaryText),
    '--site-header': safeSiteColor(theme.headerBackground, defaults.background),
    '--site-stats': safeSiteColor(theme.statsBackground, '#f8fafc'),
    '--site-featured': safeSiteColor(theme.featuredBackground, defaults.background),
    '--site-buy-rent': safeSiteColor(theme.buyRentBackground, defaults.background),
    '--site-about': safeSiteColor(theme.aboutBackground, '#f2f4f7'),
    '--site-contact': safeSiteColor(theme.contactBackground, defaults.background),
    '--site-footer': safeSiteColor(theme.footerBackground, defaults.text),
    '--site-footer-text': safeSiteColor(theme.footerText, defaults.primaryText),
    '--site-button-radius': `${theme.buttonRadius}px`,
  } as CSSProperties

  return (
    <div className="flex min-h-svh flex-col bg-[var(--site-background)] text-[var(--site-text)] [&_.bg-primary]:bg-[var(--site-primary)] [&_.text-primary]:text-[var(--site-primary)] [&_.text-muted-foreground]:text-[var(--site-muted)] [&_.bg-background]:bg-[var(--site-background)] [&_.text-foreground]:text-[var(--site-text)] [&_a[class*='bg-primary']]:text-[var(--site-primary-text)] [&_button[class*='bg-primary']]:text-[var(--site-primary-text)] [&_.rounded-md.bg-primary]:rounded-[var(--site-button-radius)]" style={style}>
      <SiteHeader org={org} customization={customization} />
      <main className="flex-1">{children}</main>
      <SiteFooter org={org} customization={customization} />
    </div>
  )
}
