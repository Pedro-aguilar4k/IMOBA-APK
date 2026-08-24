'use client'

import { useRef, useState } from 'react'
import { Upload, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { confirmDocumentUpload, prepareDocumentUpload } from '@/app/(app)/dashboard/documents/actions'
import { validateDocumentFile, type DocumentContext } from '@/lib/documents/validation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Props = DocumentContext & { documentType: string; label?: string }

export function DocumentUpload({ label = 'Anexar documento', documentType, ...context }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('PDF, JPG ou PNG de até 10 MB.')

  async function upload(file: File) {
    const validation = validateDocumentFile(file)
    if (validation) return setMessage(validation)
    setLoading(true)
    setMessage('Preparando envio seguro...')
    try {
      const input = { ...context, name: file.name, type: file.type, size: file.size, documentType }
      const prepared = await prepareDocumentUpload(input)
      if ('error' in prepared) throw new Error(prepared.error)
      const supabase = createClient()
      const { error } = await supabase.storage.from('documents').uploadToSignedUrl(prepared.path!, prepared.token!, file, { contentType: file.type })
      if (error) throw new Error('Não foi possível enviar o arquivo.')
      const confirmed = await confirmDocumentUpload({ ...input, path: prepared.path! })
      if ('error' in confirmed) throw new Error(confirmed.error)
      setMessage('Documento enviado com segurança.')
      if (inputRef.current) inputRef.current.value = ''
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Não foi possível concluir o envio.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={`document-${documentType}`}>{label}</Label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          ref={inputRef}
          id={`document-${documentType}`}
          type="file"
          accept="application/pdf,image/jpeg,image/png"
          disabled={loading}
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) void upload(file)
          }}
        />
        <Button type="button" variant="outline" disabled={loading} onClick={() => inputRef.current?.click()}>
          {loading ? <Loader2 data-icon="inline-start" className="animate-spin" /> : <Upload data-icon="inline-start" />}
          {loading ? 'Enviando' : 'Selecionar'}
        </Button>
      </div>
      <p className="text-sm text-muted-foreground" role="status" aria-live="polite">{message}</p>
    </div>
  )
}
