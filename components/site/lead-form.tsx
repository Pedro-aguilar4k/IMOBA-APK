'use client'

import { CheckCircle2 } from 'lucide-react'
import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { submitSiteLead, type LeadFormState } from '@/app/(site)/site/[slug]/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const initialState: LeadFormState = { status: 'idle' }

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? 'Enviando...' : 'Enviar mensagem'}
    </Button>
  )
}

export function LeadForm({
  organizationId,
  defaultMessage,
}: {
  organizationId: string
  defaultMessage?: string
}) {
  const [state, formAction] = useActionState(submitSiteLead, initialState)

  if (state.status === 'success') {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-border/60 bg-card p-8 text-center">
        <CheckCircle2 className="size-10 text-primary" aria-hidden="true" />
        <p className="font-display text-lg font-semibold text-foreground">Mensagem enviada!</p>
        <p className="text-sm text-muted-foreground">{state.message}</p>
      </div>
    )
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="organizationId" value={organizationId} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="lead-name">Nome</Label>
          <Input id="lead-name" name="name" required autoComplete="name" />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="lead-phone">Telefone / WhatsApp</Label>
          <Input id="lead-phone" name="phone" required inputMode="tel" autoComplete="tel" />
        </div>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="lead-email">E-mail (opcional)</Label>
        <Input id="lead-email" name="email" type="email" autoComplete="email" />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="lead-message">Mensagem</Label>
        <Textarea
          id="lead-message"
          name="message"
          rows={4}
          defaultValue={defaultMessage}
          placeholder="Conte o que você procura..."
        />
      </div>
      {state.status === 'error' && (
        <p className="text-sm text-destructive" role="alert">
          {state.message}
        </p>
      )}
      <SubmitButton />
      <p className="text-center text-xs text-muted-foreground">
        Ao enviar, você concorda em ser contatado pela nossa equipe.
      </p>
    </form>
  )
}
