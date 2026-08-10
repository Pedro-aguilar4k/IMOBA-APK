'use client'

import { useActionState, useEffect, useState } from 'react'
import { UserRoundPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createClientManually, type ClientState } from '@/app/(app)/admin/clientes/actions'

export function ClientCreateForm() {
  const [state, action, pending] = useActionState<ClientState, FormData>(createClientManually, {})
  const [formKey, setFormKey] = useState(0)

  useEffect(() => {
    if (state.success) setFormKey((k) => k + 1)
  }, [state.success])

  return (
    <form action={action} className="flex flex-col gap-4" key={formKey}>
      <div className="grid gap-2">
        <Label htmlFor="name">Nome</Label>
        <Input id="name" name="name" placeholder="Nome completo" required />
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" name="email" type="email" placeholder="email@exemplo.com" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="phone">Telefone</Label>
          <Input id="phone" name="phone" placeholder="(00) 00000-0000" />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="document">CPF / documento</Label>
        <Input id="document" name="document" placeholder="000.000.000-00" />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="notes">Observações</Label>
        <Textarea id="notes" name="notes" placeholder="Preferências, anotações..." rows={3} />
      </div>

      {state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="text-sm text-primary" role="status">
          {state.success}
        </p>
      ) : null}

      <Button type="submit" disabled={pending} className="gap-2">
        <UserRoundPlus className="size-4" aria-hidden="true" />
        {pending ? 'Salvando...' : 'Cadastrar cliente'}
      </Button>
    </form>
  )
}
