import Link from 'next/link'
import { ArrowLeft, Plus } from 'lucide-react'
import CorretorHeader from '@/components/dashboard/corretor-header'
import PropertiesList from '@/components/dashboard/properties-list'
import { buttonVariants } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/auth/roles'
import { getPropertyList } from '@/lib/properties-server'

export const metadata = { title: 'Imóveis' }

export default async function PropertiesPage() {
  const access = await requireRole('corretor')
  const supabase = await createClient()
  const [{ data: profile }, properties] = await Promise.all([
    supabase.from('profiles').select('name, email').eq('id', access.userId).single(),
    getPropertyList(supabase, access.userId),
  ])

  return (
    <div className="min-h-svh bg-background">
      <CorretorHeader name={profile?.name ?? 'Corretor'} email={profile?.email ?? access.email} />
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-primary">Portfólio</p>
            <h1 className="text-balance text-2xl font-bold tracking-tight sm:text-3xl">Meus imóveis</h1>
            <p className="text-muted-foreground">Consulte, filtre e mantenha os dados de cada imóvel.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard/corretor" className={buttonVariants({ variant: 'outline' })}><ArrowLeft data-icon="inline-start" />Dashboard</Link>
            <Link href="/dashboard/corretor/properties/new" className={buttonVariants()}><Plus data-icon="inline-start" />Novo imóvel</Link>
          </div>
        </div>
        <PropertiesList properties={properties} />
      </main>
    </div>
  )
}
