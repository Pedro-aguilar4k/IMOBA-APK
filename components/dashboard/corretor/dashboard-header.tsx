'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Bell, Building2, LogOut, Menu, Settings, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { createClient } from '@/lib/supabase/client'

interface DashboardHeaderProps {
  name: string
  email: string
  notifications?: number
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2)
  return parts.map((part) => part[0]?.toUpperCase() ?? '').join('') || 'C'
}

export default function DashboardHeader({ name, email, notifications = 0 }: DashboardHeaderProps) {
  const router = useRouter()

  const handleLogout = async () => {
    await createClient().auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex items-center justify-between gap-3 px-5 py-4">
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon" className="-ml-2 size-10" aria-label="Abrir menu" />
              }
            >
              <Menu className="size-6" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <div className="px-2 py-1.5">
                <p className="truncate text-sm font-semibold">{name}</p>
                <p className="truncate text-xs text-muted-foreground">{email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem render={<Link href="/dashboard/corretor/properties" />}>
                  <Building2 />
                  Imóveis
                </DropdownMenuItem>
                <DropdownMenuItem render={<Link href="/dashboard/corretor/clients" />}>
                  <Users />
                  Locatários
                </DropdownMenuItem>
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
          <h1 className="text-xl font-bold tracking-tight">Dashboard</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="relative flex size-11 items-center justify-center rounded-full bg-accent text-primary transition-colors hover:bg-accent/70"
            aria-label={`Notificações${notifications ? `: ${notifications} novas` : ''}`}
          >
            <Bell className="size-5" />
            {notifications > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground ring-2 ring-background">
                {notifications > 9 ? '9+' : notifications}
              </span>
            ) : null}
          </button>
          <Link
            href="/dashboard/corretor/profile"
            className="flex size-11 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground"
            aria-label="Meu perfil"
          >
            {initials(name)}
          </Link>
        </div>
      </div>
    </header>
  )
}
