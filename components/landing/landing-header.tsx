import Link from 'next/link'
import { Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Building2 className="size-5" aria-hidden="true" />
          </span>
          <span className="text-lg font-bold tracking-tight text-foreground">ImobApp</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Navegação principal">
          <a href="#recursos" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Recursos
          </a>
          <a href="#como-funciona" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Como funciona
          </a>
          <a href="#contato" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Contato
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" render={<Link href="/auth/login" />}>
            Entrar
          </Button>
          <Button render={<a href="#contato" />} className="hidden sm:inline-flex">
            Quero minha imobiliária
          </Button>
        </div>
      </div>
    </header>
  )
}
