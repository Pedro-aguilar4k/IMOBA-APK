import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import CorretorHeader from '@/components/dashboard/corretor-header'
import { PropertyForm } from '@/components/dashboard/property-form'
import { buttonVariants } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/auth/roles'

export const metadata = { title: 'Novo imóvel' }

export default async function NewPropertyPage() {
  const access = await requireRole('corretor')
  const supabase = await createClient()
  const { data: profile } = await supabase.from('profiles').select('name, email').eq('id', access.userId).single()

  return (
    <div className="min-h-svh bg-background">
      <CorretorHeader name={profile?.name ?? 'Corretor'} email={profile?.email ?? access.email} />
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-primary">Portfólio</p>
            <h1 className="text-balance text-2xl font-bold tracking-tight sm:text-3xl">Novo imóvel</h1>
            <p className="text-pretty text-muted-foreground">Cadastre os dados e as fotos que serão usados em contratos, vistorias e cobranças.</p>
          </div>
          <Link href="/dashboard/corretor" className={buttonVariants({ variant: 'outline' })}>
            <ArrowLeft data-icon="inline-start" />
            Voltar
          </Link>
        </div>
        <PropertyForm />
      </main>
    </div>
  )
}
