'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { activateFirstAccess, type FirstAccessState } from '@/app/primeiro-acesso/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const initialState: FirstAccessState = {}

export function FirstAccessForm() {
  const [state, action, pending] = useActionState(activateFirstAccess, initialState)

  return (
    <form action={action} className="flex flex-col gap-6">
      <div className="grid gap-2">
        <Label htmlFor="document">CPF</Label>
        <Input
          id="document"
          name="document"
          inputMode="numeric"
          autoComplete="off"
          placeholder="000.000.000-00"
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="birthDate">Data de nascimento</Label>
        <Input id="birthDate" name="birthDate" type="date" required />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="password">Crie uma senha</Label>
        <Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
        <p className="text-sm leading-6 text-muted-foreground">Use pelo menos 8 caracteres.</p>
      </div>

      {state.error ? (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? 'Ativando acesso...' : 'Ativar meu acesso'}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Já ativou sua conta?{' '}
        <Link href="/auth/login" className="font-medium text-foreground underline underline-offset-4">
          Entrar
        </Link>
      </p>
    </form>
  )
}
