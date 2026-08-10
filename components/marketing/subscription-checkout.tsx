'use client'

import { useCallback, useState, useTransition } from 'react'
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { Loader2, Lock } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { startOnboarding } from '@/app/(marketing)/assinar/actions'

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string,
)

export function SubscriptionCheckout({ planId }: { planId: string }) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    const form = new FormData(event.currentTarget)
    const password = String(form.get('password') ?? '')
    const confirm = String(form.get('confirmPassword') ?? '')

    if (password !== confirm) {
      setError('As senhas não coincidem.')
      return
    }

    startTransition(async () => {
      const result = await startOnboarding({
        planId,
        responsibleName: String(form.get('responsibleName') ?? ''),
        companyName: String(form.get('companyName') ?? ''),
        taxId: String(form.get('taxId') ?? ''),
        phone: String(form.get('phone') ?? ''),
        email: String(form.get('email') ?? ''),
        password,
      })

      if (result.ok) {
        setClientSecret(result.clientSecret)
      } else {
        setError(result.error)
      }
    })
  }

  const fetchClientSecret = useCallback(
    () => Promise.resolve(clientSecret ?? ''),
    [clientSecret],
  )

  // Etapa 2: pagamento embutido do Stripe.
  if (clientSecret) {
    return (
      <div id="checkout" className="w-full">
        <EmbeddedCheckoutProvider
          stripe={stripePromise}
          options={{ fetchClientSecret }}
        >
          <EmbeddedCheckout />
        </EmbeddedCheckoutProvider>
      </div>
    )
  }

  // Etapa 1: ficha de cadastro (dados + criação de acesso).
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <h2 className="font-display text-lg font-semibold">Seus dados</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Preencha a ficha da sua imobiliária e crie seu acesso. O pagamento é a
          próxima etapa.
        </p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="responsibleName">Nome do responsável</Label>
        <Input id="responsibleName" name="responsibleName" required autoComplete="name" />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="companyName">Nome da imobiliária</Label>
        <Input id="companyName" name="companyName" required autoComplete="organization" />
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="taxId">CNPJ ou CPF</Label>
          <Input id="taxId" name="taxId" required inputMode="numeric" placeholder="00.000.000/0000-00" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="phone">Telefone</Label>
          <Input id="phone" name="phone" required inputMode="tel" autoComplete="tel" placeholder="(11) 90000-0000" />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="email">E-mail de acesso</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" />
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="password">Senha</Label>
          <Input id="password" name="password" type="password" required autoComplete="new-password" minLength={8} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="confirmPassword">Confirmar senha</Label>
          <Input id="confirmPassword" name="confirmPassword" type="password" required autoComplete="new-password" minLength={8} />
        </div>
      </div>

      {error ? (
        <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <Button type="submit" size="lg" disabled={pending} className="h-12 rounded-full text-base font-semibold">
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Preparando pagamento...
          </>
        ) : (
          <>
            <Lock className="size-4" />
            Ir para o pagamento
          </>
        )}
      </Button>

      <p className="text-center text-xs leading-relaxed text-muted-foreground">
        Após o pagamento, você receberá um link para confirmar o e-mail e ativar
        o acesso.
      </p>
    </form>
  )
}
