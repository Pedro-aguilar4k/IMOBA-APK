'use client'

import { useState, useTransition } from 'react'
import { toggleSitePublished } from '@/app/dashboard/corretor/site/actions'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, Globe } from 'lucide-react'

interface SitePublishCardProps {
  published: boolean
  siteUrl: string
  previewUrl: string
  customDomain: string | null
  customDomainVerified: boolean
}

export function SitePublishCard({
  published,
  siteUrl,
  previewUrl,
  customDomain,
  customDomainVerified,
}: SitePublishCardProps) {
  const [isPublished, setIsPublished] = useState(published)
  const [pending, startTransition] = useTransition()

  function toggle() {
    startTransition(async () => {
      const res = await toggleSitePublished(!isPublished)
      if (!res?.error) setIsPublished(!isPublished)
    })
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          <Globe className="size-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-semibold text-foreground">Site público</p>
            <Badge variant={isPublished ? 'default' : 'secondary'} className="mt-1">
              {isPublished ? 'Publicado' : 'Rascunho'}
            </Badge>
          </div>
        </div>
        <Button variant={isPublished ? 'outline' : 'default'} onClick={toggle} disabled={pending}>
          {pending ? '...' : isPublished ? 'Despublicar' : 'Publicar'}
        </Button>
      </div>

      <dl className="mt-4 flex flex-col gap-3 border-t border-border pt-4 text-sm">
        <div className="flex flex-col gap-1">
          <dt className="text-muted-foreground">Endereço do site</dt>
          <dd className="font-medium text-foreground break-all">{siteUrl}</dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-muted-foreground">Domínio próprio</dt>
          <dd className="font-medium text-foreground">
            {customDomain ? (
              <span className="inline-flex items-center gap-2 break-all">
                {customDomain}
                <Badge variant={customDomainVerified ? 'default' : 'secondary'}>
                  {customDomainVerified ? 'verificado' : 'aguardando DNS'}
                </Badge>
              </span>
            ) : (
              <span className="text-muted-foreground">Não configurado (solicite ao administrador)</span>
            )}
          </dd>
        </div>
      </dl>

      <a
        href={previewUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
      >
        <ExternalLink className="size-4" /> Ver meu site
      </a>
    </div>
  )
}
