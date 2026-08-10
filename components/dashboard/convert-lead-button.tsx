'use client'

import { useActionState } from 'react'
import { UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { convertLeadToClient, type ClientState } from '@/app/(app)/admin/clientes/actions'

interface ConvertLeadButtonProps {
  leadId: string
}

export function ConvertLeadButton({ leadId }: ConvertLeadButtonProps) {
  const [state, action, pending] = useActionState<ClientState, FormData>(convertLeadToClient, {})

  return (
    <form action={action} className="flex flex-col items-end gap-1">
      <input type="hidden" name="leadId" value={leadId} />
      <Button type="submit" size="sm" variant="outline" disabled={pending} className="gap-1.5">
        <UserPlus className="size-4" aria-hidden="true" />
        {pending ? 'Convertendo...' : 'Tornar cliente'}
      </Button>
      {state.error ? (
        <span className="text-xs text-destructive" role="alert">
          {state.error}
        </span>
      ) : null}
    </form>
  )
}
