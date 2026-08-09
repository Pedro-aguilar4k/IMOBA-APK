'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { Calendar, Eye, EyeOff, IdCard, Loader2, Lock, Mail } from 'lucide-react'
import { activateFirstAccess, type FirstAccessState } from '@/app/(app)/primeiro-acesso/actions'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const initialState: FirstAccessState = {}

export function FirstAccessForm() {
  const [state, action, pending] = useActionState(activateFirstAccess, initialState)
  const [showPassword, setShowPassword] = useState(false)

  return (
    <form action={action} className="mt-8 flex w-full flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="document" className="text-sm font-medium text-foreground">
          CPF
        </Label>
        <div className="relative">
          <IdCard
            className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="document"
            name="document"
            inputMode="numeric"
            autoComplete="off"
            placeholder="000.000.000-00"
            required
            className="h-14 rounded-xl bg-card pl-12 text-base shadow-sm"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="birthDate" className="text-sm font-medium text-foreground">
          Data de nascimento
        </Label>
        <div className="relative">
          <Calendar
            className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="birthDate"
            name="birthDate"
            type="date"
            required
            className="h-14 rounded-xl bg-card pl-12 text-base shadow-sm"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email" className="text-sm font-medium text-foreground">
          E-mail
        </Label>
        <div className="relative">
          <Mail
            className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="seu@email.com"
            required
            className="h-14 rounded-xl bg-card pl-12 text-base shadow-sm"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password" className="text-sm font-medium text-foreground">
          Crie uma senha
        </Label>
        <div className="relative">
          <Lock
            className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="Mínimo de 8 caracteres"
            minLength={8}
            required
            className="h-14 rounded-xl bg-card pl-12 pr-12 text-base shadow-sm"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground"
            aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
          >
            {showPassword ? (
              <EyeOff className="size-5" aria-hidden="true" />
            ) : (
              <Eye className="size-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {state.error ? (
        <p role="alert" className="text-sm leading-6 text-destructive">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-primary text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? <Loader2 className="size-5 animate-spin" aria-hidden="true" /> : null}
        {pending ? 'Ativando acesso...' : 'Ativar meu acesso'}
      </button>

      <Link
        href="/auth/login"
        className="flex h-14 w-full items-center justify-center rounded-xl border border-primary/40 bg-background text-base font-semibold text-primary transition-colors hover:bg-accent"
      >
        Voltar para o login
      </Link>
    </form>
  )
}
