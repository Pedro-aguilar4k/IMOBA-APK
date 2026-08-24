'use client'

import { useState } from 'react'
import { Download, Loader2, Trash2 } from 'lucide-react'
import { deleteDocument, getDocumentDownloadUrl } from '@/app/(app)/dashboard/documents/actions'
import { Button } from '@/components/ui/button'

export function DocumentActions({ id, canDelete = true }: { id: string; canDelete?: boolean }) {
  const [pending, setPending] = useState<'download' | 'delete' | null>(null)

  async function download() {
    setPending('download')
    const result = await getDocumentDownloadUrl(id)
    setPending(null)
    if ('url' in result && result.url) window.location.assign(result.url)
  }

  async function remove() {
    if (!window.confirm('Excluir este documento permanentemente?')) return
    setPending('delete')
    await deleteDocument(id)
    setPending(null)
  }

  return (
    <div className="flex gap-2">
      <Button className="flex-1" variant="outline" size="sm" onClick={download} disabled={pending !== null}>
        {pending === 'download' ? <Loader2 data-icon="inline-start" className="animate-spin" /> : <Download data-icon="inline-start" />}
        Baixar
      </Button>
      {canDelete && (
        <Button variant="ghost" size="icon-sm" onClick={remove} disabled={pending !== null} aria-label="Excluir documento">
          {pending === 'delete' ? <Loader2 className="animate-spin" /> : <Trash2 />}
        </Button>
      )}
    </div>
  )
}
