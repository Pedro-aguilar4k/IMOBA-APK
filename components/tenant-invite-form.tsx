'use client'

import { useActionState } from 'react'
import { createTenantInvite, type TenantInviteState } from '@/app/(app)/dashboard/corretor/clients/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const initialState: TenantInviteState = {}

export function TenantInviteForm() {
  const [state, action, pending] = useActionState(createTenantInvite, initialState)

  return (
    <form action={action} className="flex flex-col gap-5">
      <div className="grid gap-2">
        <Label htmlFor="name">Nome completo</Label>
        <Input id="name" name="name" autoComplete="name" required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="cpf">CPF</Label>
        <Input id="cpf" name="cpf" inputMode="numeric" placeholder="000.000.000-00" required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="birthDate">Data de nascimento</Label>
        <Input id="birthDate" name="birthDate" type="date" required />
      </div>

      {state.error ? <p role="alert" className="text-sm text-destructive">{state.error}</p> : null}
      {state.success ? <p role="status" className="rounded-lg border border-border bg-muted p-3 text-sm text-foreground">{state.success}</p> : null}

      <Button type="submit" disabled={pending}>
        {pending ? 'Cadastrando...' : 'Cadastrar locatário'}
      </Button>
    </form>
  )
}
