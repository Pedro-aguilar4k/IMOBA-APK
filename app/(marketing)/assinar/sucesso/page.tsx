import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { CircleCheck, ArrowRight, Mail, TriangleAlert } from 'lucide-react'

import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { getPlan } from '@/lib/plans'
import { finalizeSubscription } from '@/app/(marketing)/assinar/actions'

export const metadata: Metadata = {
  title: 'Assinatura confirmada — IMOBA',
  robots: { index: false },
}

export default async function SubscriptionSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const { session_id: sessionId } = await searchParams

  if (!sessionId) {
    redirect('/planos')
  }

  const result = await finalizeSubscription(sessionId)

  // Pagamento ainda não concluído.
  if (result.status === 'pending') {
    redirect('/planos')
  }

  if (result.status === 'error') {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-4 py-16 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-destructive/10">
          <TriangleAlert className="size-9 text-destructive" />
        </div>
        <h1 className="mt-6 font-display text-2xl font-bold tracking-tight text-balance">
          Não conseguimos finalizar sua assinatura
        </h1>
        <p className="mt-4 text-pretty text-muted-foreground">
          Seu pagamento pode ter sido processado, mas houve um erro ao criar seu
          acesso. Entre em contato com nosso suporte para regularizar.
        </p>
        <Link
          href="/contato"
          className={cn(buttonVariants({ size: 'lg' }), 'mt-8 h-12 rounded-full px-6 font-semibold')}
        >
          Falar com o suporte
        </Link>
      </div>
    )
  }

  const plan = result.planId ? getPlan(result.planId) : undefined
  const activationUrl = result.activationToken
    ? `/ativar?token=${result.activationToken}`
    : null

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-4 py-16 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
        <CircleCheck className="size-9 text-primary" />
      </div>

      <h1 className="mt-6 font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl">
        Pagamento confirmado!
      </h1>

      <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
        {plan
          ? `${result.companyName ?? 'Sua imobiliária'} agora está no plano ${plan.name}.`
          : 'Sua assinatura foi ativada com sucesso.'}{' '}
        Falta só confirmar seu acesso.
      </p>

      <div className="mt-8 w-full rounded-2xl border border-border bg-card p-6 text-left">
        <div className="flex items-start gap-3">
          <Mail className="mt-0.5 size-5 shrink-0 text-primary" />
          <div className="flex-1">
            <p className="font-semibold text-card-foreground">
              {result.alreadyActivated ? 'Acesso já ativado' : 'Confirme seu acesso'}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {result.alreadyActivated ? (
                <>Seu acesso já foi confirmado. Faça login para começar.</>
              ) : (
                <>
                  Enviamos um link de confirmação para{' '}
                  <span className="font-medium text-foreground">
                    {result.email}
                  </span>
                  . Clique no botão abaixo para confirmar seu e-mail e ativar o
                  login da sua imobiliária.
                </>
              )}
            </p>

            {!result.alreadyActivated && activationUrl ? (
              <Link
                href={activationUrl}
                className={cn(
                  buttonVariants({ size: 'lg' }),
                  'mt-4 h-11 rounded-full px-6 font-semibold',
                )}
              >
                Confirmar e ativar acesso
                <ArrowRight className="size-4" />
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      {result.alreadyActivated ? (
        <Link
          href="/auth/login"
          className={cn(buttonVariants({ size: 'lg' }), 'mt-8 h-12 rounded-full px-6 font-semibold')}
        >
          Fazer login
          <ArrowRight className="size-4" />
        </Link>
      ) : null}
    </div>
  )
}
