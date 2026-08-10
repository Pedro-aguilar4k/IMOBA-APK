import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Building2, Mail, Phone, FileText, CreditCard } from 'lucide-react'

import { createAdminClient } from '@/lib/supabase/admin'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  type SubscriptionRow,
  getDelinquency,
  getDelinquencyBadge,
  DELINQUENCY_LABEL,
  STATUS_LABEL,
  planName,
  formatBRLCents,
  formatDate,
  formatTaxId,
  formatPhone,
} from '@/lib/subscriptions'

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3 py-3">
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="truncate text-sm text-foreground">{value}</p>
      </div>
    </div>
  )
}

export default async function SubscriptionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const admin = createAdminClient()
  const { data } = await admin
    .from('subscriptions')
    .select('*')
    .eq('id', id)
    .limit(1)

  const sub = (data?.[0] ?? null) as SubscriptionRow | null
  if (!sub) notFound()

  const delinquency = getDelinquency(sub.status)

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <Link
        href="/plataforma/assinaturas"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Voltar às assinaturas
      </Link>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-balance">
            {sub.company_name ?? 'Imobiliária'}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Cliente desde {formatDate(sub.created_at)}
          </p>
        </div>
        <Badge variant={getDelinquencyBadge(delinquency)}>
          {DELINQUENCY_LABEL[delinquency]}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Plano e cobrança */}
        <Card className="p-5">
          <h2 className="font-display text-base font-semibold">Plano e cobrança</h2>
          <dl className="mt-4 flex flex-col gap-3 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Plano</dt>
              <dd className="font-medium">{planName(sub.plan_id)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Valor mensal</dt>
              <dd className="font-medium">{formatBRLCents(sub.amount_cents)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Status Stripe</dt>
              <dd className="font-medium">{STATUS_LABEL[sub.status]}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Próxima cobrança</dt>
              <dd className="font-medium">{formatDate(sub.current_period_end)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Acesso confirmado</dt>
              <dd className="font-medium">{sub.email_confirmed ? 'Sim' : 'Não'}</dd>
            </div>
          </dl>
        </Card>

        {/* Dados do cliente */}
        <Card className="divide-y divide-border p-5">
          <h2 className="pb-2 font-display text-base font-semibold">Dados do cliente</h2>
          <InfoRow icon={Building2} label="Responsável" value={sub.responsible_name ?? '—'} />
          <InfoRow icon={Mail} label="E-mail" value={sub.contact_email ?? '—'} />
          <InfoRow icon={Phone} label="Telefone" value={formatPhone(sub.contact_phone)} />
          <InfoRow icon={FileText} label="CNPJ / CPF" value={formatTaxId(sub.tax_id)} />
        </Card>
      </div>

      {/* Identificadores Stripe */}
      <Card className="p-5">
        <div className="flex items-center gap-2">
          <CreditCard className="size-4 text-muted-foreground" aria-hidden="true" />
          <h2 className="font-display text-base font-semibold">Identificadores Stripe</h2>
        </div>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Customer ID</dt>
            <dd className="mt-1 break-all font-mono text-xs text-foreground">
              {sub.stripe_customer_id ?? '—'}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Subscription ID</dt>
            <dd className="mt-1 break-all font-mono text-xs text-foreground">
              {sub.stripe_subscription_id ?? '—'}
            </dd>
          </div>
        </dl>
      </Card>
    </div>
  )
}
