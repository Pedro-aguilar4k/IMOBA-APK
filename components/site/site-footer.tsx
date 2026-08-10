import { AtSign, Mail, MapPin, Phone } from 'lucide-react'
import Link from 'next/link'
import type { SiteOrganization } from '@/lib/site/site-data'

export function SiteFooter({ org }: { org: SiteOrganization }) {
  const base = `/site/${org.slug}`
  return (
    <footer className="border-t border-border/60 bg-secondary/40">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
        <div className="flex flex-col gap-3">
          <span className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-md bg-primary font-display text-lg font-bold text-primary-foreground">
              {org.name.charAt(0)}
            </span>
            <span className="font-display text-lg font-semibold text-foreground">{org.name}</span>
          </span>
          <p className="max-w-xs text-pretty text-sm leading-relaxed text-muted-foreground">
            {org.tagline ?? 'Encontre o imóvel ideal para viver ou investir.'}
          </p>
          {org.creci && <p className="text-xs text-muted-foreground">{org.creci}</p>}
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="font-display text-sm font-semibold text-foreground">Navegação</h3>
          <Link href={base} className="text-sm text-muted-foreground hover:text-foreground">
            Início
          </Link>
          <Link href={`${base}/imoveis`} className="text-sm text-muted-foreground hover:text-foreground">
            Todos os imóveis
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
          <h3 className="font-display text-sm font-semibold text-foreground">Contato</h3>
          {org.phone && (
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="size-4 shrink-0 text-primary" aria-hidden="true" />
              {org.phone}
            </span>
          )}
          {org.email && (
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="size-4 shrink-0 text-primary" aria-hidden="true" />
              {org.email}
            </span>
          )}
          {(org.city || org.state) && (
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="size-4 shrink-0 text-primary" aria-hidden="true" />
              {[org.city, org.state].filter(Boolean).join(' - ')}
            </span>
          )}
          {org.instagram && (
            <a
              href={`https://instagram.com/${org.instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <AtSign className="size-4 shrink-0 text-primary" aria-hidden="true" />@{org.instagram}
            </a>
          )}
        </div>
      </div>

      <div className="border-t border-border/60">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
          <p>
            © {new Date().getFullYear()} {org.name}. Todos os direitos reservados.
          </p>
          <p>Feito com IMOBA</p>
        </div>
      </div>
    </footer>
  )
}
