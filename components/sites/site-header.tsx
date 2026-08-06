import Link from 'next/link'
import { Building2 } from 'lucide-react'

interface SiteHeaderProps {
  slug: string
  name: string
  logoUrl: string | null
  basePath: string
}

export function SiteHeader({ name, logoUrl, basePath }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href={basePath || '/'} className="flex items-center gap-2.5">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl || '/placeholder.svg'} alt={name} className="h-9 w-auto object-contain" />
          ) : (
            <span className="flex size-9 items-center justify-center rounded-lg bg-[var(--brand)] text-white">
              <Building2 className="size-5" />
            </span>
          )}
          <span className="text-lg font-bold tracking-tight text-foreground">{name}</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm font-medium">
          <Link
            href={`${basePath}/imoveis`}
            className="rounded-md px-3 py-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            Imóveis
          </Link>
          <Link
            href={`${basePath}/sobre`}
            className="rounded-md px-3 py-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            Sobre
          </Link>
          <Link
            href={`${basePath}/contato`}
            className="rounded-md bg-[var(--brand)] px-4 py-2 text-white transition-opacity hover:opacity-90"
          >
            Contato
          </Link>
        </nav>
      </div>
    </header>
  )
}
