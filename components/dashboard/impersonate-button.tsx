'use client'

import { Eye } from 'lucide-react'
import { startImpersonation } from '@/app/admin/impersonation/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

export function ImpersonateButton({
  organizationId,
  organizationName,
}: {
  organizationId: string
  organizationName: string
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="outline" size="sm" className="gap-2" />}>
        <Eye className="size-4" />
        Entrar como
      </AlertDialogTrigger>
      <AlertDialogContent>
        <form action={startImpersonation} className="flex flex-col gap-4">
          <AlertDialogHeader>
            <AlertDialogTitle>Entrar como {organizationName}</AlertDialogTitle>
            <AlertDialogDescription>
              Você vai operar o painel desta imobiliária em modo visualização. Todas as ações ficam
              registradas na auditoria e a sessão expira em 1 hora.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <input type="hidden" name="organizationId" value={organizationId} />

          <div className="flex flex-col gap-2 text-left">
            <Label htmlFor={`reason-${organizationId}`}>Motivo (opcional)</Label>
            <Input
              id={`reason-${organizationId}`}
              name="reason"
              placeholder="Ex.: suporte ao cliente"
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel type="button">Cancelar</AlertDialogCancel>
            <Button type="submit" className="gap-2">
              <Eye className="size-4" />
              Entrar
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}
