import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { Check, ArrowLeft, ShieldCheck } from 'lucide-react'

import { getPlan, formatBRL } from '@/lib/plans'
import { SubscriptionCheckout } from '@/components/marketing/subscription-checkout'

export const metadata: Metadata = {
  title: 'Assinar plano — IMOBA',
  description: 'Finalize a assinatura da sua imobiliária na plataforma IMOBA.',
}

export default async function SubscribePage({
  params,
}: {
  params: Promise<{ plano: string }>
}) {
  const { plano } = await params
  const plan = getPlan(plano)

  if (!plan) {
    notFound()
  }

  // Planos fechados via vendas não passam pelo checkout automático.
  if (plan.contactOnly) {
    redirect(`/contato?plano=${plan.id}`)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/planos"
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Voltar aos planos
      </Link>

      <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
        {/* Resumo do plano */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            Plano {plan.name}
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-balance">
            {plan.tagline}
          </h1>

          <div className="mt-6 flex items-baseline gap-1">
            <span className="font-display text-4xl font-bold">
              {formatBRL(plan.priceMonthly)}
            </span>
            <span className="text-muted-foreground">/mês</span>
          </div>

          <ul className="mt-8 space-y-3">
            {plan.features.map((feature) => (
              <li key={feature} className="flex items-start gap-3 text-sm">
                <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                <span className="text-muted-foreground">{feature}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex items-center gap-2 rounded-lg border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
            <ShieldCheck className="size-5 shrink-0 text-primary" />
            <span>
              Pagamento seguro processado pela Stripe. Cancele quando quiser.
            </span>
          </div>
        </div>

        {/* Checkout embutido */}
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6">
          <SubscriptionCheckout planId={plan.id} />
        </div>
      </div>
    </div>
  )
}
