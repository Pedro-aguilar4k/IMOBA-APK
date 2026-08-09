'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { useSearchParams } from 'next/navigation'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import { submitContact, type ContactState } from '@/app/(marketing)/contato/actions'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const initialState: ContactState = { status: 'idle' }

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" size="lg" disabled={pending} className="h-12 w-full rounded-full text-base font-semibold">
      {pending ? 'Enviando…' : 'Enviar mensagem'}
    </Button>
  )
}

const VALID_PLANS = ['essencial', 'profissional', 'escala']

export function ContactForm() {
  const [state, formAction] = useActionState(submitContact, initialState)
  const searchParams = useSearchParams()
  const planParam = searchParams.get('plano') ?? ''
  const defaultPlan = VALID_PLANS.includes(planParam) ? planParam : 'indeciso'

  if (state.status === 'success') {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-10 text-center">
        <CheckCircle2 className="size-12 text-primary" aria-hidden />
        <h2 className="font-display text-xl font-bold text-card-foreground">Mensagem enviada!</h2>
        <p className="text-pretty text-sm text-muted-foreground">{state.message}</p>
      </div>
    )
  }

  return (
    <form action={formAction} className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-6 sm:p-8">
      {state.status === 'error' && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" aria-hidden />
          <span>{state.message}</span>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="name">Nome *</Label>
          <Input id="name" name="name" required placeholder="Seu nome" autoComplete="name" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="company">Imobiliária</Label>
          <Input id="company" name="company" placeholder="Nome da sua imobiliária" autoComplete="organization" />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">E-mail *</Label>
          <Input id="email" name="email" type="email" required placeholder="voce@imobiliaria.com" autoComplete="email" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="phone">Telefone / WhatsApp</Label>
          <Input id="phone" name="phone" placeholder="(00) 00000-0000" autoComplete="tel" />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="plan_interest">Plano de interesse</Label>
        <select
          id="plan_interest"
          name="plan_interest"
          defaultValue={defaultPlan}
          className={cn(
            'h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors',
            'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30',
          )}
        >
          <option value="essencial">Essencial</option>
          <option value="profissional">Profissional</option>
          <option value="escala">Escala</option>
          <option value="indeciso">Ainda não sei</option>
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="message">Mensagem *</Label>
        <Textarea
          id="message"
          name="message"
          required
          rows={4}
          placeholder="Conte um pouco sobre a sua imobiliária e o que você precisa."
        />
      </div>

      <SubmitButton />
      <p className="text-center text-xs text-muted-foreground">
        Ao enviar, você concorda em ser contatado pela equipe IMOBA.
      </p>
    </form>
  )
}
