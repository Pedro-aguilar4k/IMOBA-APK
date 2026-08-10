'use client'

import { Menu, Phone, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { buttonVariants } from '@/components/ui/button'
import type { SiteOrganization } from '@/lib/site/site-data'
import type { SiteCustomization } from '@/lib/site/customization'
import { whatsappLink } from '@/lib/site/format'
import { cn } from '@/lib/utils'

export function SiteHeader({ org, customization }: { org: SiteOrganization; customization?: SiteCustomization }) {
  const brand = customization?.brand
  const [open, setOpen] = useState(false)
  const base = `/site/${org.slug}`
  const nav = [
    { href: base, label: 'Início' },
    { href: `${base}/imoveis`, label: 'Imóveis' },
    { href: `${base}/imoveis?purpose=venda`, label: 'Comprar' },
    { href: `${base}/imoveis?purpose=aluguel`, label: 'Alugar' },
    { href: `${base}#sobre`, label: 'Sobre' },
    { href: `${base}#contato`, label: 'Contato' },
  ]
  const wpp = whatsappLink(org.whatsapp, `Olá! Vim pelo site da ${org.name} e gostaria de mais informações.`)

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href={base} className="flex items-center gap-2.5">
          {brand?.logoUrl || org.logo_url ? (
            <Image src={brand?.logoUrl || org.logo_url || "/placeholder.svg"} alt={brand?.displayName || org.name} width={36} height={36} className="rounded-md" />
          ) : (
            <span className="flex size-9 items-center justify-center rounded-md bg-primary font-display text-lg font-bold text-primary-foreground">
              {(brand?.displayName || org.name).charAt(0)}
            </span>
          )}
          <span className="font-display text-lg font-semibold leading-tight text-foreground">
            {brand?.displayName || org.name}
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {nav.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {wpp && (
            <a
              href={wpp}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ variant: 'default' }), 'gap-2')}
            >
              <Phone className="size-4" aria-hidden="true" />
              Falar com corretor
            </a>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex size-10 items-center justify-center rounded-md text-foreground lg:hidden"
          aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={open}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border/60 bg-background lg:hidden">
          <nav className="mx-auto flex w-full max-w-7xl flex-col gap-1 px-4 py-3">
            {nav.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2.5 text-base font-medium text-foreground transition-colors hover:bg-accent"
              >
                {item.label}
              </Link>
            ))}
            {wpp && (
              <a
                href={wpp}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants({ variant: 'default' }), 'mt-2 w-full gap-2')}
              >
                <Phone className="size-4" aria-hidden="true" />
                Falar com corretor
              </a>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
