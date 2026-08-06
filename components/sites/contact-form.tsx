'use client'

import { useActionState } from 'react'
import { submitLead, type LeadFormState } from '@/app/sites/[key]/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle2 } from 'lucide-react'

interface ContactFormProps {
  siteKey: string
  propertyId?: string
  compact?: boolean
}

export function ContactForm({ siteKey, propertyId, compact = false }: ContactFormProps) {
  const [state, action, pending] = useActionState<LeadFormState, FormData>(
    submitLead.bind(null, siteKey),
    {},
  )

  if (state.success) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-8 text-center">
        <CheckCircle2 className="size-10 text-[var(--brand)]" />
        <p className="text-lg font-semibold text-foreground">Mensagem enviada!</p>
        <p className="text-sm text-muted-foreground">
          Recebemos seu contato e retornaremos em breve.
        </p>
      </div>
    )
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      {propertyId ? <input type="hidden" name="propertyId" value={propertyId} /> : null}
      <div className={compact ? 'grid gap-4' : 'grid gap-4 sm:grid-cols-2'}>
        <div className="grid gap-1.5">
          <Label htmlFor="lead-name">Nome</Label>
          <Input id="lead-name" name="name" required placeholder="Seu nome" />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="lead-phone">Telefone / WhatsApp</Label>
          <Input id="lead-phone" name="phone" placeholder="(00) 00000-0000" />
        </div>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="lead-email">E-mail</Label>
        <Input id="lead-email" name="email" type="email" placeholder="voce@email.com" />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="lead-message">Mensagem</Label>
        <Textarea
          id="lead-message"
          name="message"
          rows={compact ? 3 : 4}
          placeholder="Tenho interesse neste imóvel..."
        />
      </div>
      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      <Button
        type="submit"
        disabled={pending}
        className="bg-[var(--brand)] text-white hover:bg-[var(--brand)]/90"
      >
        {pending ? 'Enviando...' : 'Enviar mensagem'}
      </Button>
    </form>
  )
}
