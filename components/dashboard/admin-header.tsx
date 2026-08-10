'use client'

import { CreditCard, LayoutDashboard, LogOut, Menu, Users } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/admin', label: 'Painel', icon: LayoutDashboard, exact: true },
  { href: '/admin/corretores', label: 'Corretores', icon: Users, exact: false },
]

interface AdminHeaderProps {
  email: string
  organizationName?: string
}

export function AdminHeader({ email, organizationName }: AdminHeaderProps) {
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = async () => {
    await createClient().auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-6">
          <div className="min-w-0">
            <p className="truncate text-base font-bold text-foreground">
              {organizationName ?? 'Administração'}
            </p>
            <p className="text-xs text-muted-foreground">Painel da imobiliária</p>
          </div>

          <nav className="hidden items-center gap-1 sm:flex">
            {NAV.map((item) => {
              const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
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
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" size="icon" aria-label="Abrir menu da conta" />}>
            <Menu className="size-5" aria-hidden="true" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <div className="px-2 py-1.5">
              <p className="text-sm font-semibold">Administrador</p>
              <p className="truncate text-xs text-muted-foreground">{email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<Link href="/admin" />} className="sm:hidden">
              <LayoutDashboard className="size-4" aria-hidden="true" />
              Painel
            </DropdownMenuItem>
            <DropdownMenuItem render={<Link href="/admin/corretores" />} className="sm:hidden">
              <Users className="size-4" aria-hidden="true" />
              Corretores
            </DropdownMenuItem>
            <DropdownMenuSeparator className="sm:hidden" />
            <DropdownMenuItem render={<Link href="/admin/conta" />}>
              <CreditCard className="size-4" aria-hidden="true" />
              Minha assinatura
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              <LogOut className="size-4" aria-hidden="true" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
