import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { CircleCheck, ArrowRight, Mail } from 'lucide-react'

import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { getPlan } from '@/lib/plans'
import { getCheckoutResult } from '@/app/(marketing)/planos/actions'

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

  const result = await getCheckoutResult(sessionId)

  // Sessão ainda aberta = pagamento não concluído.
  if (result.status !== 'complete') {
    redirect('/planos')
  }

  const plan = result.planId ? getPlan(result.planId) : undefined

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-4 py-16 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
        <CircleCheck className="size-9 text-primary" />
      </div>

      <h1 className="mt-6 font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl">
        Assinatura confirmada!
      </h1>

      <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
        {plan
          ? `Sua imobiliária agora está no plano ${plan.name}.`
          : 'Sua assinatura foi ativada com sucesso.'}{' '}
        Seja bem-vindo(a) ao IMOBA.
      </p>

      <div className="mt-8 w-full rounded-2xl border border-border bg-card p-6 text-left">
        <div className="flex items-start gap-3">
          <Mail className="mt-0.5 size-5 shrink-0 text-primary" />
          <div>
            <p className="font-semibold text-card-foreground">Próximo passo</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {result.customerEmail ? (
                <>
                  Enviamos as instruções de configuração para{' '}
                  <span className="font-medium text-foreground">
                    {result.customerEmail}
                  </span>
                  .{' '}
                </>
              ) : null}
              Vamos criar o acesso de administrador da sua imobiliária para você
              começar a cadastrar imóveis, corretores e locatários.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/painel"
          className={cn(buttonVariants({ size: 'lg' }), 'h-12 rounded-full px-6 font-semibold')}
        >
          Acessar o painel
          <ArrowRight className="size-4" />
        </Link>
        <Link
          href="/"
          className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'h-12 rounded-full px-6 font-semibold')}
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  )
}
