'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  DollarSign,
  FileText,
  Home,
  LogOut,
  MessageCircle,
  MoreHorizontal,
  Plus,
  Settings,
  Wrench,
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

const leftItems = [
  { label: 'Início', href: '/dashboard/locatario', icon: Home, match: 'exact' as const },
  { label: 'Pagamentos', href: '/dashboard/locatario/payments', icon: DollarSign, match: 'startsWith' as const },
]

const rightItems = [
  { label: 'Documentos', href: '/dashboard/locatario/documents', icon: FileText, match: 'startsWith' as const },
]

const moreLinks = ['/dashboard/locatario/maintenance', '/dashboard/locatario/profile']

export default function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await createClient().auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  const moreActive = moreLinks.some((href) => pathname.startsWith(href))

  const renderItem = (item: (typeof leftItems)[number]) => {
    const active = item.match === 'exact' ? pathname === item.href : pathname.startsWith(item.href)
    const Icon = item.icon
    return (
      <li key={item.href} className="min-w-0">
        <Link
          href={item.href}
          aria-current={active ? 'page' : undefined}
          className={cn(
            'flex flex-col items-center gap-1 px-1 py-2.5 text-xs font-medium transition-colors',
            active ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <Icon className="size-6" strokeWidth={active ? 2.4 : 2} />
          <span className="truncate">{item.label}</span>
        </Link>
      </li>
    )
  }

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="mx-auto grid w-full max-w-md grid-cols-5 items-end px-2">
        {leftItems.map(renderItem)}

        {/* FAB central: Novo chamado */}
        <li className="min-w-0">
          <Link
            href="/dashboard/locatario/maintenance"
            className="flex flex-col items-center gap-1 px-1 py-1.5 text-xs font-medium text-foreground"
          >
            <span className="flex size-14 -translate-y-4 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 ring-4 ring-background transition-transform active:scale-95">
              <Plus className="size-7" strokeWidth={2.4} />
            </span>
            <span className="-mt-3 truncate">Novo chamado</span>
          </Link>
        </li>

        {rightItems.map(renderItem)}

        <li className="min-w-0">
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
                <DropdownMenuItem render={<Link href="/dashboard/locatario/maintenance" />}>
                  <Wrench />
                  Chamados
                </DropdownMenuItem>
                <DropdownMenuItem render={<Link href="/dashboard/locatario/documents" />}>
                  <MessageCircle />
                  Mensagens
                </DropdownMenuItem>
                <DropdownMenuItem render={<Link href="/dashboard/locatario/profile" />}>
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
