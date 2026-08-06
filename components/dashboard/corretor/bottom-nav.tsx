'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { DollarSign, Home, KeyRound, LayoutGrid, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

const items = [
  { label: 'Início', href: '/dashboard/corretor', icon: LayoutGrid, match: 'exact' as const },
  { label: 'Imóveis', href: '/dashboard/corretor/properties', icon: Home, match: 'startsWith' as const },
  { label: 'Locações', href: '/dashboard/corretor/contracts', icon: KeyRound, match: 'startsWith' as const },
  { label: 'Financeiro', href: '/dashboard/corretor/clients', icon: DollarSign, match: 'startsWith' as const },
  { label: 'Mais', href: '/dashboard/corretor/profile', icon: MoreHorizontal, match: 'startsWith' as const },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="mx-auto flex w-full max-w-md items-stretch justify-between px-2">
        {items.map((item) => {
          const active =
            item.match === 'exact' ? pathname === item.href : pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex flex-col items-center gap-1 px-1 py-2.5 text-xs font-medium transition-colors',
                  active ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <Icon className="size-6" strokeWidth={active ? 2.4 : 2} />
                <span>{item.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
