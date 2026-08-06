'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Building2, Globe, LogOut, Menu, Settings, Users, UsersRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { createClient } from '@/lib/supabase/client'

interface CorretorHeaderProps { name: string; email: string; isOwner?: boolean }

export default function CorretorHeader({ name, email, isOwner = false }: CorretorHeaderProps) {
  const router = useRouter()

  const handleLogout = async () => {
    await createClient().auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  return (
    <header className="sticky top-0 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/dashboard/corretor" className="flex min-w-0 items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Building2 className="size-5" /></span>
          <span className="min-w-0"><span className="block truncate font-semibold">Gestão Imobiliária</span><span className="block truncate text-xs text-muted-foreground">Painel do corretor</span></span>
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" size="icon" aria-label="Abrir menu da conta" />}><Menu /></DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5"><p className="truncate text-sm font-semibold">{name}</p><p className="truncate text-xs text-muted-foreground">{email}</p></div>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem render={<Link href="/dashboard/corretor/properties" />}><Building2 />Imóveis</DropdownMenuItem>
              <DropdownMenuItem render={<Link href="/dashboard/corretor/clients" />}><Users />Locatários</DropdownMenuItem>
              {isOwner ? (<DropdownMenuItem render={<Link href="/dashboard/corretor/team" />}><UsersRound />Equipe</DropdownMenuItem>) : null}
              {isOwner ? (<DropdownMenuItem render={<Link href="/dashboard/corretor/site" />}><Globe />Meu site</DropdownMenuItem>) : null}
              <DropdownMenuItem render={<Link href="/dashboard/corretor/profile" />}><Settings />Meu perfil</DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup><DropdownMenuItem onClick={handleLogout} variant="destructive"><LogOut />Sair</DropdownMenuItem></DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
