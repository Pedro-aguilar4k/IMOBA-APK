import { Suspense } from 'react'

import { createAdminClient } from '@/lib/supabase/admin'
import {
  type SubscriptionRow,
  type Delinquency,
  getDelinquency,
} from '@/lib/subscriptions'
import { SubscriptionsTable } from '@/components/plataforma/subscriptions-table'
import { SubscriptionsFilter } from '@/components/plataforma/subscriptions-filter'

export default async function SubscriptionsListPage({
  searchParams,
}: {
  searchParams: Promise<{ situacao?: string; q?: string }>
}) {
  const { situacao, q } = await searchParams
  const admin = createAdminClient()
  const { data } = await admin
    .from('subscriptions')
    .select('*')
    .order('created_at', { ascending: false })

  let rows = (data ?? []) as SubscriptionRow[]

  if (situacao) {
    rows = rows.filter((r) => getDelinquency(r.status) === (situacao as Delinquency))
  }

  if (q) {
    const term = q.toLowerCase()
    rows = rows.filter(
      (r) =>
        r.company_name?.toLowerCase().includes(term) ||
        r.contact_email?.toLowerCase().includes(term) ||
        r.responsible_name?.toLowerCase().includes(term),
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Assinaturas</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {rows.length} {rows.length === 1 ? 'assinatura' : 'assinaturas'} encontradas.
        </p>
      </div>

      <Suspense fallback={<div className="h-10" />}>
        <SubscriptionsFilter />
      </Suspense>

      <SubscriptionsTable rows={rows} />
    </div>
  )
}
