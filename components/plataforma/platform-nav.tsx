'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, CreditCard, House } from 'lucide-react'

import { cn } from '@/lib/utils'

const NAV = [
  { href: '/plataforma', label: 'Visão geral', icon: LayoutDashboard, exact: true },
  { href: '/plataforma/assinaturas', label: 'Assinaturas', icon: CreditCard, exact: false },
]

export function PlatformNav({ variant = 'sidebar' }: { variant?: 'sidebar' | 'bar' }) {
  const pathname = usePathname()

  if (variant === 'bar') {
    return (
      <nav className="flex items-center gap-1">
        {NAV.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    )
  }

  return (
    <nav className="flex flex-col gap-1">
      <Link
        href="/"
        className="mb-4 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold"
      >
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <House className="size-4" aria-hidden="true" />
        </span>
        <span className="font-display text-base tracking-tight">
          IMOBA<span className="ml-1 text-xs font-normal text-muted-foreground">plataforma</span>
        </span>
      </Link>

      {NAV.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href)
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              active
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
