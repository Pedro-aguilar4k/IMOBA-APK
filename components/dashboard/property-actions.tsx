'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Archive, LoaderCircle, Pencil } from 'lucide-react'
import { changePropertyStatus } from '@/app/dashboard/corretor/properties/actions'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import type { PropertyStatus } from '@/lib/properties'

export function PropertyActions({ propertyId, status }: { propertyId: string; status: PropertyStatus }) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')

  const updateStatus = async (nextStatus: PropertyStatus) => {
    setPending(true)
    setError('')
    const result = await changePropertyStatus(propertyId, nextStatus)
    setPending(false)
    if (result.error) setError(result.error)
    else router.refresh()
  }

  return (
    <div className="flex flex-col items-stretch gap-2 sm:items-end">
      <div className="flex flex-wrap gap-2">
        <Link href={`/dashboard/corretor/properties/${propertyId}/edit`} className={buttonVariants({ variant: 'outline' })}>
          <Pencil data-icon="inline-start" />Editar
        </Link>
        {status === 'inactive' ? (
          <Button onClick={() => updateStatus('available')} disabled={pending}>
            {pending ? <LoaderCircle data-icon="inline-start" className="animate-spin" /> : null}
            Reativar imóvel
          </Button>
        ) : (
          <AlertDialog>
            <AlertDialogTrigger render={<Button variant="destructive" disabled={pending} />}>
              <Archive data-icon="inline-start" />Desativar
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Desativar este imóvel?</AlertDialogTitle>
                <AlertDialogDescription>O imóvel deixará de aparecer como disponível, mas seu histórico, fotos e vínculos serão preservados.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction variant="destructive" onClick={() => updateStatus('inactive')}>Desativar imóvel</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
      {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
    </div>
  )
}
