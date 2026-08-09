'use client'

import { useActionState } from 'react'
import { createBrokerAccount, type BrokerAccountState } from '@/app/(app)/admin/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const initialState: BrokerAccountState = {}

export function BrokerAccountForm() {
  const [state, action, pending] = useActionState(createBrokerAccount, initialState)

  return (
    <form action={action} className="flex flex-col gap-5">
      <div className="grid gap-2">
        <Label htmlFor="organizationName">Nome da imobiliária</Label>
        <Input id="organizationName" name="organizationName" autoComplete="organization" required />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="brokerName">Nome do corretor responsável</Label>
        <Input id="brokerName" name="brokerName" autoComplete="name" required />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="cnpj">CNPJ</Label>
        <Input id="cnpj" name="cnpj" inputMode="numeric" placeholder="00.000.000/0000-00" required />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="email">E-mail de acesso</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="temporaryPassword">Senha temporária</Label>
        <Input
          id="temporaryPassword"
          name="temporaryPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
        <p className="text-sm leading-6 text-muted-foreground">
          Use ao menos 8 caracteres, com maiúscula, minúscula e número.
        </p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="confirmPassword">Confirmar senha temporária</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </div>

      {state.error ? <p role="alert" className="text-sm text-destructive">{state.error}</p> : null}

      {state.success ? (
        <div role="status" className="rounded-lg border border-border bg-muted p-4">
          <p className="text-sm leading-6 text-foreground">{state.success}</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            No primeiro login, o corretor deverá criar uma senha definitiva.
          </p>
        </div>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? 'Criando conta...' : 'Criar conta do corretor'}
      </Button>
    </form>
  )
}
