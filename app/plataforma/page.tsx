import Link from 'next/link'
import { Users, CircleCheck, TriangleAlert, DollarSign } from 'lucide-react'

import { createAdminClient } from '@/lib/supabase/admin'
import {
  type SubscriptionRow,
  getDelinquency,
  formatBRLCents,
} from '@/lib/subscriptions'
import { StatCard } from '@/components/plataforma/stat-card'
import { SubscriptionsTable } from '@/components/plataforma/subscriptions-table'

export default async function PlatformOverviewPage() {
  const admin = createAdminClient()
  const { data } = await admin
    .from('subscriptions')
    .select('*')
    .order('created_at', { ascending: false })

  const rows = (data ?? []) as SubscriptionRow[]

  const active = rows.filter((r) => getDelinquency(r.status) === 'adimplente')
  const delinquent = rows.filter((r) => getDelinquency(r.status) === 'inadimplente')
  const pending = rows.filter((r) => getDelinquency(r.status) === 'pendente')

  const mrrCents = active.reduce((sum, r) => sum + (r.amount_cents ?? 0), 0)
  const recent = rows.slice(0, 6)

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Visão geral</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Acompanhe as assinaturas e a saúde financeira da plataforma.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Assinantes ativos"
          value={String(active.length)}
          hint={`${rows.length} no total`}
          icon={Users}
        />
        <StatCard
          label="Receita recorrente"
          value={formatBRLCents(mrrCents)}
          hint="MRR estimado"
          icon={DollarSign}
          tone="positive"
        />
        <StatCard
          label="Inadimplentes"
          value={String(delinquent.length)}
          hint="Pagamento em atraso"
          icon={TriangleAlert}
          tone={delinquent.length > 0 ? 'negative' : 'muted'}
        />
        <StatCard
          label="Pendentes"
          value={String(pending.length)}
          hint="Aguardando pagamento"
          icon={CircleCheck}
          tone="muted"
        />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Assinaturas recentes</h2>
          <Link
            href="/plataforma/assinaturas"
            className="text-sm font-medium text-primary hover:underline"
          >
            Ver todas
          </Link>
        </div>
        <SubscriptionsTable rows={recent} />
      </div>
    </div>
  )
}
