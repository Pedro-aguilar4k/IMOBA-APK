'use client'

import { useActionState } from 'react'
import { UserPlus } from 'lucide-react'
import { createTeamMember, type TeamMemberState } from '@/app/dashboard/corretor/team/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const initialState: TeamMemberState = {}

export function TeamMemberForm() {
  const [state, formAction, pending] = useActionState(createTeamMember, initialState)

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="team-name">Nome do corretor</Label>
        <Input id="team-name" name="name" autoComplete="name" placeholder="Maria Souza" required />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="team-email">E-mail</Label>
        <Input
          id="team-email"
          name="email"
          type="email"
          autoComplete="off"
          placeholder="corretor@imobiliaria.com"
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="team-password">Senha temporária</Label>
        <Input
          id="team-password"
          name="temporaryPassword"
          type="text"
          autoComplete="off"
          placeholder="Mínimo 8 caracteres, com maiúscula e número"
          required
        />
        <p className="text-xs text-muted-foreground">
          O corretor troca a senha no primeiro acesso. Entregue essas credenciais com segurança.
        </p>
      </div>

      {state.error ? (
        <p role="alert" className="text-sm font-medium text-destructive">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p role="status" className="text-sm font-medium text-emerald-600">
          {state.success}
        </p>
      ) : null}

      <Button type="submit" disabled={pending} className="gap-2">
        <UserPlus className="size-4" />
        {pending ? 'Criando...' : 'Adicionar corretor'}
      </Button>
    </form>
  )
}
