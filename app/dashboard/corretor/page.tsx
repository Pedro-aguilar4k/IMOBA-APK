import Link from 'next/link'
import { ArrowRight, Plus } from 'lucide-react'
import CorretorHeader from '@/components/dashboard/corretor-header'
import PropertiesList from '@/components/dashboard/properties-list'
import ContractsList from '@/components/dashboard/contracts-list'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/auth/roles'
import { getPropertyList } from '@/lib/properties-server'

export default async function CorretorDashboard() {
  const access = await requireRole('corretor')
  const supabase = await createClient()
  const [{ data: profile }, properties, { data: contracts }] = await Promise.all([
    supabase.from('profiles').select('name, email').eq('id', access.userId).single(),
    getPropertyList(supabase, access.userId),
    supabase.from('contracts').select('*').eq('corretor_id', access.userId),
  ])

  const contractIds = (contracts ?? []).map((contract) => contract.id)
  const { data: payments } = contractIds.length
    ? await supabase.from('payments').select('*').in('contract_id', contractIds)
    : { data: [] }

  const activeContracts = contracts?.filter((contract) => contract.status === 'active').length ?? 0
  const pendingPayments = payments?.filter((payment) => payment.status === 'overdue').length ?? 0
  const totalRevenue = contracts?.reduce((sum, contract) => sum + (contract.monthly_rent || 0), 0) ?? 0

  return (
    <div className="min-h-svh bg-background">
      <CorretorHeader name={profile?.name ?? 'Corretor'} email={profile?.email ?? access.email} />
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:py-8">
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Resumo da operação">
          <StatCard label="Imóveis" value={String(properties.length)} description="No portfólio" />
          <StatCard label="Contratos ativos" value={String(activeContracts)} description="Locações em andamento" />
          <StatCard label="Renda mensal" value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalRevenue / 100)} description="Aluguel contratado" />
          <StatCard label="Pagamentos atrasados" value={String(pendingPayments)} description="Requerem atenção" destructive={pendingPayments > 0} />
        </section>

        <div className="grid gap-8 lg:grid-cols-2">
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <div><h2 className="text-xl font-semibold">Meus imóveis</h2><p className="text-sm text-muted-foreground">Cadastros mais recentes do portfólio.</p></div>
              <Link href="/dashboard/corretor/properties/new" className={buttonVariants({ size: 'sm' })}><Plus data-icon="inline-start" />Novo</Link>
            </div>
            <PropertiesList properties={properties.slice(0, 4)} compact />
            {properties.length ? <Link href="/dashboard/corretor/properties" className={buttonVariants({ variant: 'outline' })}>Ver todos os imóveis<ArrowRight data-icon="inline-end" /></Link> : null}
          </section>

          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <div><h2 className="text-xl font-semibold">Contratos recentes</h2><p className="text-sm text-muted-foreground">Últimas movimentações contratuais.</p></div>
              <Link href="/dashboard/corretor/contracts" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>Ver tudo</Link>
            </div>
            <ContractsList corretorId={access.userId} limit={5} />
          </section>
        </div>
      </main>
    </div>
  )
}

function StatCard({ label, value, description, destructive = false }: { label: string; value: string; description: string; destructive?: boolean }) {
  return <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle></CardHeader><CardContent className="flex flex-col gap-1"><p className={destructive ? 'text-3xl font-bold text-destructive' : 'text-3xl font-bold'}>{value}</p><p className="text-xs text-muted-foreground">{description}</p></CardContent></Card>
}
