import { AtSign, Mail, MapPin, Phone } from 'lucide-react'
import Link from 'next/link'
import type { SiteOrganization } from '@/lib/site/site-data'
import type { SiteCustomization } from '@/lib/site/customization'

export function SiteFooter({ org, customization }: { org: SiteOrganization; customization: SiteCustomization }) {
  const base = `/site/${org.slug}`
  const { brand, footer, navigation } = customization
  return (
    <footer className="border-t border-border/60 bg-[var(--site-footer)] text-[var(--site-footer-text)] [&_.text-foreground]:text-[var(--site-footer-text)] [&_.text-muted-foreground]:text-[var(--site-footer-text)]/75">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
        <div className="flex flex-col gap-3">
          <span className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-md bg-primary font-display text-lg font-bold text-primary-foreground">
              {brand.displayName.charAt(0)}
            </span>
            <span className="font-display text-lg font-semibold text-foreground">{brand.displayName}</span>
          </span>
          <p className="max-w-xs text-pretty text-sm leading-relaxed text-muted-foreground">
            {brand.tagline}
          </p>
          {brand.creci && <p className="text-xs text-muted-foreground">{brand.creci}</p>}
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="font-display text-sm font-semibold text-foreground">{footer.navigationTitle}</h3>
          <Link href={base} className="text-sm text-muted-foreground hover:text-foreground">
            {navigation.home}
          </Link>
          <Link href={`${base}/imoveis`} className="text-sm text-muted-foreground hover:text-foreground">
            {navigation.properties}
          </Link>
          <Link
            href={`${base}/imoveis?purpose=venda`}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Imóveis à venda
          </Link>
          <Link
            href={`${base}/imoveis?purpose=aluguel`}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Imóveis para alugar
          </Link>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="font-display text-sm font-semibold text-foreground">{footer.contactTitle}</h3>
          {brand.phone && (
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="size-4 shrink-0 text-primary" aria-hidden="true" />
              {brand.phone}
            </span>
          )}
          {brand.email && (
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="size-4 shrink-0 text-primary" aria-hidden="true" />
              {brand.email}
            </span>
          )}
          {(org.city || org.state) && (
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="size-4 shrink-0 text-primary" aria-hidden="true" />
              {[org.city, org.state].filter(Boolean).join(' - ')}
            </span>
          )}
          {brand.instagram && (
            <a
              href={`https://instagram.com/${brand.instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <AtSign className="size-4 shrink-0 text-primary" aria-hidden="true" />@{brand.instagram}
            </a>
          )}
        </div>
      </div>

      <div className="border-t border-border/60">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
          <p>
            © {new Date().getFullYear()} {brand.displayName}. {footer.rightsText}
          </p>
          <p>{footer.signatureText}</p>
        </div>
      </div>
    </footer>
  )
}
