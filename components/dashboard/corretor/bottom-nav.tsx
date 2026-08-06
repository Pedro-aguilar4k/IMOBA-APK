'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Building2,
  DollarSign,
  Globe,
  Home,
  KeyRound,
  LayoutGrid,
  LogOut,
  MoreHorizontal,
  Settings,
  Users,
  UsersRound,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

const items = [
  { label: 'Início', href: '/dashboard/corretor', icon: LayoutGrid, match: 'exact' as const },
  { label: 'Imóveis', href: '/dashboard/corretor/properties', icon: Home, match: 'startsWith' as const },
  { label: 'Locações', href: '/dashboard/corretor/contracts', icon: KeyRound, match: 'startsWith' as const },
  { label: 'Financeiro', href: '/dashboard/corretor/clients', icon: DollarSign, match: 'startsWith' as const },
]

const moreLinks = ['/dashboard/corretor/profile']

export default function BottomNav({ isOwner = false }: { isOwner?: boolean }) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await createClient().auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  const moreActive = moreLinks.some((href) => pathname.startsWith(href))

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

        <li className="flex-1">
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                'flex w-full flex-col items-center gap-1 px-1 py-2.5 text-xs font-medium transition-colors',
                moreActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
              )}
              aria-label="Mais opções"
            >
              <MoreHorizontal className="size-6" strokeWidth={moreActive ? 2.4 : 2} />
              <span>Mais</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="top" sideOffset={12} className="w-56">
              <DropdownMenuGroup>
                <DropdownMenuItem render={<Link href="/dashboard/corretor/properties" />}>
                  <Building2 />
                  Imóveis
                </DropdownMenuItem>
                <DropdownMenuItem render={<Link href="/dashboard/corretor/clients" />}>
                  <Users />
                  Locatários
                </DropdownMenuItem>
                {isOwner ? (
                  <DropdownMenuItem render={<Link href="/dashboard/corretor/team" />}>
                    <UsersRound />
                    Equipe
                  </DropdownMenuItem>
                ) : null}
                {isOwner ? (
                  <DropdownMenuItem render={<Link href="/dashboard/corretor/site" />}>
                    <Globe />
                    Meu site
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuItem render={<Link href="/dashboard/corretor/profile" />}>
                  <Settings />
                  Meu perfil
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} variant="destructive">
                <LogOut />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </li>
      </ul>
    </nav>
  )
}
