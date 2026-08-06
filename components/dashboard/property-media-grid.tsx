'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ImageIcon, LoaderCircle, Star, Trash2 } from 'lucide-react'
import { deletePropertyMedia, setPropertyCover } from '@/app/dashboard/corretor/properties/actions'
import type { PropertyMediaRecord } from '@/lib/properties'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'

export function PropertyMediaGrid({ media, editable = false }: { media: PropertyMediaRecord[]; editable?: boolean }) {
  const router = useRouter()
  const [pendingId, setPendingId] = useState('')
  const [error, setError] = useState('')

  const run = async (id: string, action: (mediaId: string) => Promise<{ error?: string }>) => {
    setPendingId(id)
    setError('')
    const result = await action(id)
    setPendingId('')
    if (result.error) setError(result.error)
    else router.refresh()
  }

  if (!media.length) {
    return <Empty className="border"><EmptyHeader><EmptyMedia variant="icon"><ImageIcon /></EmptyMedia><EmptyTitle>Sem fotos</EmptyTitle><EmptyDescription>Adicione fotos na edição do imóvel para criar a galeria.</EmptyDescription></EmptyHeader></Empty>
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {media.map((item) => (
          <div key={item.id} className="group overflow-hidden rounded-xl border border-border bg-card">
            <div className="relative aspect-[4/3] bg-muted">
              {item.signedUrl ? <Image src={item.signedUrl} alt="Foto do imóvel" fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover" unoptimized /> : null}
              {item.is_cover ? <Badge className="absolute left-2 top-2"><Star data-icon="inline-start" />Capa</Badge> : null}
            </div>
            {editable ? (
              <div className="flex justify-end gap-2 p-2">
                {!item.is_cover ? <Button size="sm" variant="outline" disabled={Boolean(pendingId)} onClick={() => run(item.id, setPropertyCover)}>{pendingId === item.id ? <LoaderCircle data-icon="inline-start" className="animate-spin" /> : <Star data-icon="inline-start" />}Usar como capa</Button> : null}
                <Button size="icon-sm" variant="ghost" aria-label="Remover foto" disabled={Boolean(pendingId)} onClick={() => run(item.id, deletePropertyMedia)}>{pendingId === item.id ? <LoaderCircle className="animate-spin" /> : <Trash2 />}</Button>
              </div>
            ) : null}
          </div>
        ))}
      </div>
      {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
    </div>
  )
}
