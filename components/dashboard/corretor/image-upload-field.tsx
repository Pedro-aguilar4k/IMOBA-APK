'use client'

import { useRef, useState, useTransition } from 'react'
import { ImageIcon, Loader2, Upload, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import {
  createBrandingUpload,
  registerBrandingUpload,
  removeBrandingAsset,
} from '@/app/dashboard/corretor/site/branding-actions'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ImageUploadFieldProps {
  assetKey: string
  label: string
  hint?: string
  value: string | null
  organizationId?: string
  /** Notifica o container (preview ao vivo). */
  onChange?: (url: string | null) => void
  /** Prévia em fundo escuro (ex.: logo para tema escuro). */
  dark?: boolean
  className?: string
}

const BRANDING_MAX = 2 * 1024 * 1024

export function ImageUploadField({
  assetKey,
  label,
  hint,
  value,
  organizationId,
  onChange,
  dark,
  className,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [url, setUrl] = useState<string | null>(value)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const [uploading, setUploading] = useState(false)

  async function handleFile(file: File) {
    setError(null)
    if (file.size > BRANDING_MAX) {
      setError('A imagem deve ter no máximo 2 MB.')
      return
    }
    setUploading(true)
    try {
      const prep = await createBrandingUpload(
        assetKey,
        { name: file.name, type: file.type, size: file.size },
        organizationId,
      )
      if ('error' in prep) {
        setError(prep.error ?? 'Falha ao preparar o envio.')
        return
      }

      const supabase = createClient()
      const { error: uploadError } = await supabase.storage
        .from('org-branding')
        .uploadToSignedUrl(prep.path, prep.token, file)
      if (uploadError) {
        setError('Falha ao enviar a imagem. Tente novamente.')
        return
      }

      const result = await registerBrandingUpload(
        assetKey,
        { path: prep.path, type: file.type, size: file.size },
        organizationId,
      )
      if ('error' in result) {
        setError(result.error ?? 'Falha ao salvar a imagem.')
        return
      }
      setUrl(result.url ?? null)
      onChange?.(result.url ?? null)
    } finally {
      setUploading(false)
    }
  }

  function handleRemove() {
    startTransition(async () => {
      const result = await removeBrandingAsset(assetKey, organizationId)
      if ('error' in result) {
        setError(result.error ?? 'Falha ao remover a imagem.')
        return
      }
      setUrl(null)
      onChange?.(null)
    })
  }

  const busy = uploading || pending

  return (
    <div className={cn('grid gap-2', className)}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-foreground">{label}</span>
        {url ? (
          <button
            type="button"
            onClick={handleRemove}
            disabled={busy}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-destructive"
          >
            <X className="size-3.5" /> Remover
          </button>
        ) : null}
      </div>

      <div
        className={cn(
          'relative flex aspect-[3/1] items-center justify-center overflow-hidden rounded-lg border border-dashed border-border transition-colors',
          dark ? 'bg-slate-900' : 'bg-muted/40',
          !url && 'cursor-pointer hover:border-primary/60',
        )}
        onClick={() => !url && !busy && inputRef.current?.click()}
      >
        {busy ? (
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        ) : url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url || '/placeholder.svg'} alt={label} className="max-h-full max-w-full object-contain p-2" />
        ) : (
          <div className="flex flex-col items-center gap-1 p-4 text-center">
            <ImageIcon className="size-5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Clique para enviar</span>
          </div>
        )}
      </div>

      {url ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="w-fit"
        >
          <Upload className="size-3.5" /> Trocar imagem
        </Button>
      ) : null}

      {hint ? <p className="text-xs leading-5 text-muted-foreground">{hint}</p> : null}
      {error ? <p className="text-xs leading-5 text-destructive">{error}</p> : null}

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml,image/x-icon"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) void handleFile(file)
          e.target.value = ''
        }}
      />
    </div>
  )
}
