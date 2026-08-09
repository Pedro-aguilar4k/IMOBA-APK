'use client'

import { useState } from 'react'
import Link from 'next/link'
import { House, Menu, X } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { href: '/#recursos', label: 'Recursos' },
  { href: '/#como-funciona', label: 'Como funciona' },
  { href: '/planos', label: 'Planos' },
  { href: '/contato', label: 'Contato' },
]

export function SiteHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <House className="size-5" aria-hidden="true" strokeWidth={2.25} />
          </span>
          <span className="font-display text-xl font-bold tracking-tight text-foreground">IMOBA</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Navegação principal">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/auth/login"
            className="text-sm font-semibold text-foreground transition-colors hover:text-primary"
          >
            Entrar
          </Link>
          <Link href="/planos" className={cn(buttonVariants({ size: 'lg' }), 'rounded-full px-5 font-semibold')}>
            Começar agora
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="flex size-10 items-center justify-center rounded-lg text-foreground md:hidden"
          aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={open}
        >
          {open ? <X className="size-6" aria-hidden="true" /> : <Menu className="size-6" aria-hidden="true" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-border/60 bg-background md:hidden">
          <nav className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-4 py-4" aria-label="Navegação móvel">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-base font-medium text-foreground transition-colors hover:bg-muted"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-3 flex flex-col gap-3 border-t border-border/60 pt-4">
              <Link
                href="/auth/login"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-base font-semibold text-foreground transition-colors hover:bg-muted"
              >
                Entrar
              </Link>
              <Link
                href="/planos"
                onClick={() => setOpen(false)}
                className={cn(buttonVariants({ size: 'lg' }), 'h-12 rounded-full text-base font-semibold')}
              >
                Começar agora
              </Link>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  )
}
