import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import {
  type SubscriptionRow,
  getDelinquency,
  getDelinquencyBadge,
  DELINQUENCY_LABEL,
  planName,
  formatBRLCents,
  formatDate,
} from '@/lib/subscriptions'

export function SubscriptionsTable({ rows }: { rows: SubscriptionRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-10 text-center">
        <p className="text-sm text-muted-foreground">
          Nenhuma assinatura encontrada.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      {/* Cabeçalho (desktop) */}
      <div className="hidden grid-cols-[1.6fr_1fr_0.9fr_1fr_1.1fr_auto] gap-4 border-b border-border bg-muted/40 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground md:grid">
        <span>Imobiliária</span>
        <span>Plano</span>
        <span>Valor</span>
        <span>Situação</span>
        <span>Próx. cobrança</span>
        <span className="sr-only">Abrir</span>
      </div>

      <ul className="divide-y divide-border">
        {rows.map((row) => {
          const delinquency = getDelinquency(row.status)
          return (
            <li key={row.id}>
              <Link
                href={`/plataforma/assinaturas/${row.id}`}
                className="grid grid-cols-1 gap-2 px-5 py-4 transition-colors hover:bg-muted/40 md:grid-cols-[1.6fr_1fr_0.9fr_1fr_1.1fr_auto] md:items-center md:gap-4"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">
                    {row.company_name ?? 'Imobiliária'}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">
                    {row.contact_email ?? '—'}
                  </p>
                </div>

                <div className="text-sm text-muted-foreground md:text-foreground">
                  <span className="md:hidden">Plano: </span>
                  {planName(row.plan_id)}
                </div>

                <div className="text-sm font-medium">
                  {formatBRLCents(row.amount_cents)}
                  <span className="text-muted-foreground md:hidden">/mês</span>
                </div>

                <div>
                  <Badge variant={getDelinquencyBadge(delinquency)}>
                    {DELINQUENCY_LABEL[delinquency]}
                  </Badge>
                </div>

                <div className="text-sm text-muted-foreground">
                  <span className="md:hidden">Próx. cobrança: </span>
                  {formatDate(row.current_period_end)}
                </div>

                <ChevronRight
                  className="hidden size-4 shrink-0 text-muted-foreground md:block"
                  aria-hidden="true"
                />
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
