'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { Check, Globe, Loader2 } from 'lucide-react'

import { saveDomain as saveCustomDomain, type DomainState } from '@/app/(app)/admin/conta/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const initialState: DomainState = { ok: false }

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="font-semibold">
      {pending ? (
        <>
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          Salvando...
        </>
      ) : (
        'Salvar domínio'
      )}
    </Button>
  )
}

interface DomainFormProps {
  currentDomain: string | null
}

export function DomainForm({ currentDomain }: DomainFormProps) {
  const [state, formAction] = useActionState(saveCustomDomain, initialState)

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="domain">Seu domínio</Label>
        <div className="relative">
          <Globe
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="domain"
            name="domain"
            type="text"
            inputMode="url"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="minhaimobiliaria.com.br"
            defaultValue={currentDomain ?? ''}
            className="pl-9"
          />
        </div>
        <p className="text-xs leading-5 text-muted-foreground">
          Digite apenas o domínio, sem {'"https://"'} ou {'"www"'}. Deixe em branco para remover.
        </p>
      </div>

      {state.error ? (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      ) : null}

      {state.ok ? (
        <p className="flex items-center gap-2 text-sm text-primary">
          <Check className="size-4" aria-hidden="true" />
          Domínio salvo! Configure o DNS para concluir a verificação.
        </p>
      ) : null}

      <SubmitButton />
    </form>
  )
}
