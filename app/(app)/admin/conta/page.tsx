import Link from 'next/link'
import { ArrowLeft, Check, CreditCard, Building2 } from 'lucide-react'

import { AdminHeader } from '@/components/dashboard/admin-header'
import { DomainForm } from '@/components/conta/domain-form'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { requireRole } from '@/lib/auth/roles'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPlan } from '@/lib/plans'
import { cn } from '@/lib/utils'
import {
  STATUS_LABEL,
  getDelinquency,
  getDelinquencyBadge,
  DELINQUENCY_LABEL,
  planName,
  formatBRLCents,
  formatDate,
  type SubscriptionRow,
} from '@/lib/subscriptions'

export default async function ContaPage() {
  const access = await requireRole('admin')
  const organizationId = access.assignment.organization_id
  const admin = createAdminClient()

  const [{ data: organization }, { data: subscription }] = await Promise.all([
    organizationId
      ? admin
          .from('organizations')
          .select('id, name, custom_domain, domain_status')
          .eq('id', organizationId)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    organizationId
      ? admin
          .from('subscriptions')
          .select('*')
          .eq('organization_id', organizationId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ])

  const sub = subscription as SubscriptionRow | null
  const plan = sub ? getPlan(sub.plan_id) : null
  const delinquency = sub ? getDelinquency(sub.status) : null

  return (
    <div className="min-h-svh bg-background">
      <AdminHeader email={access.email} />
      <main className="mx-auto flex max-w-5xl flex-col gap-6 p-4 md:p-8">
        <div>
          <Link
            href="/admin"
            className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Voltar para administração
          </Link>
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
            Minha assinatura
          </h2>
          <p className="text-sm text-muted-foreground">
            {organization?.name ?? 'Sua imobiliária'}
          </p>
        </div>

        {/* Plano contratado */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="size-5 text-primary" aria-hidden="true" />
                  Plano contratado
                </CardTitle>
                <CardDescription>Detalhes da sua assinatura com a IMOBA.</CardDescription>
              </div>
              {delinquency ? (
                <Badge variant={getDelinquencyBadge(delinquency)}>
                  {DELINQUENCY_LABEL[delinquency]}
                </Badge>
              ) : null}
            </div>
          </CardHeader>
          <CardContent>
            {sub ? (
              <div className="flex flex-col gap-6">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Plano</p>
                    <p className="font-semibold text-foreground">{planName(sub.plan_id)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Valor mensal</p>
                    <p className="font-semibold text-foreground">
                      {formatBRLCents(sub.amount_cents)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Situação da cobrança</p>
                    <p className="font-semibold text-foreground">{STATUS_LABEL[sub.status]}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Próxima cobrança</p>
                    <p className="font-semibold text-foreground">
                      {formatDate(sub.current_period_end)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Início</p>
                    <p className="font-semibold text-foreground">{formatDate(sub.created_at)}</p>
                  </div>
                </div>

                {plan ? (
                  <div className="rounded-lg border border-border p-4">
                    <p className="mb-3 text-sm font-medium text-foreground">
                      Incluído no {plan.name}
                    </p>
                    <ul className="grid gap-2 sm:grid-cols-2">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {delinquency === 'inadimplente' ? (
                  <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                    Há uma cobrança em aberto. Regularize o pagamento para manter o acesso da sua
                    equipe.
                  </p>
                ) : null}
              </div>
            ) : (
              <div className="flex flex-col items-start gap-3 py-4">
                <p className="text-sm text-muted-foreground">
                  Não encontramos uma assinatura ativa vinculada a esta imobiliária.
                </p>
                <Link href="/planos" className={cn(buttonVariants({ size: 'sm' }))}>
                  Ver planos
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Configuração de domínio */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="size-5 text-primary" aria-hidden="true" />
              Domínio personalizado
            </CardTitle>
            <CardDescription>
              Use seu próprio endereço para o portal da imobiliária.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DomainForm
              currentDomain={organization?.custom_domain ?? null}
              status={(organization?.domain_status ?? 'nao_configurado') as 'nao_configurado' | 'pendente' | 'verificado'}
            />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
