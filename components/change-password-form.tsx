'use client'

import { useActionState } from 'react'
import { changeTemporaryPassword, type ChangePasswordState } from '@/app/(app)/auth/trocar-senha/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const initialState: ChangePasswordState = {}

export function ChangePasswordForm() {
  const [state, action, pending] = useActionState(changeTemporaryPassword, initialState)

  return (
    <form action={action} className="flex flex-col gap-5">
      <div className="grid gap-2">
        <Label htmlFor="password">Nova senha</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          disabled={pending}
        />
        <p className="text-sm leading-6 text-muted-foreground">
          Use ao menos 8 caracteres, com maiúscula, minúscula e número.
        </p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          disabled={pending}
        />
      </div>

      {state.error ? <p role="alert" className="text-sm text-destructive">{state.error}</p> : null}

      <Button type="submit" disabled={pending}>
        {pending ? 'Atualizando senha...' : 'Salvar nova senha'}
      </Button>
    </form>
  )
}
