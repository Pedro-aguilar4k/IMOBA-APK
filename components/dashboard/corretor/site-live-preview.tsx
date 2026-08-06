'use client'

import { Monitor, Smartphone } from 'lucide-react'
import { useState } from 'react'
import { fontStack } from '@/lib/sites/fonts'
import type { BrandingState } from '@/lib/sites/branding-types'
import { cn } from '@/lib/utils'

export function SiteLivePreview({ branding, orgName }: { branding: BrandingState; orgName: string }) {
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop')

  const heading = fontStack(branding.headingFont)
  const body = fontStack(branding.bodyFont)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">Prévia ao vivo</span>
        <div className="inline-flex rounded-md border border-border p-0.5">
          <button
            type="button"
            onClick={() => setDevice('desktop')}
            className={cn(
              'inline-flex size-7 items-center justify-center rounded transition-colors',
              device === 'desktop' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground',
            )}
            aria-label="Visualizar em desktop"
          >
            <Monitor className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => setDevice('mobile')}
            className={cn(
              'inline-flex size-7 items-center justify-center rounded transition-colors',
              device === 'mobile' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground',
            )}
            aria-label="Visualizar em mobile"
          >
            <Smartphone className="size-4" />
          </button>
        </div>
      </div>

      {/* moldura do navegador */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center gap-1.5 border-b border-border bg-muted/60 px-3 py-2">
          <span className="size-2.5 rounded-full bg-red-400" />
          <span className="size-2.5 rounded-full bg-amber-400" />
          <span className="size-2.5 rounded-full bg-green-400" />
        </div>

        <div className="flex justify-center bg-muted/30 p-4">
          <div
            className={cn(
              'overflow-hidden rounded-lg border border-border shadow-sm transition-all',
              device === 'mobile' ? 'w-[320px]' : 'w-full',
            )}
            style={{ backgroundColor: branding.backgroundColor }}
          >
            {/* header do site */}
            <div className="flex items-center justify-between px-4 py-3">
              {branding.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={branding.logoUrl || '/placeholder.svg'} alt={orgName} className="h-6 w-auto object-contain" />
              ) : (
                <span className="text-sm font-bold" style={{ fontFamily: heading, color: branding.secondaryColor }}>
                  {orgName}
                </span>
              )}
              <span
                className="rounded-md px-2.5 py-1 text-[10px] font-semibold text-white"
                style={{ backgroundColor: branding.brandColor }}
              >
                Contato
              </span>
            </div>

            {/* hero */}
            <div
              className="relative flex flex-col gap-2 px-4 py-8"
              style={{
                background: branding.heroImageUrl
                  ? `linear-gradient(rgba(0,0,0,.45),rgba(0,0,0,.45)), url(${branding.heroImageUrl}) center/cover`
                  : `linear-gradient(135deg, ${branding.brandColor}, ${branding.secondaryColor})`,
              }}
            >
              <span
                className="text-balance text-lg font-bold leading-tight text-white"
                style={{ fontFamily: heading }}
              >
                {branding.heroTitle || 'Encontre seu próximo imóvel'}
              </span>
              <span className="text-pretty text-xs text-white/90" style={{ fontFamily: body }}>
                {branding.heroSubtitle || 'Imóveis selecionados para você'}
              </span>
              <div className="mt-2 flex gap-2">
                <span
                  className="rounded-md px-3 py-1.5 text-[11px] font-semibold text-white"
                  style={{ backgroundColor: branding.accentColor }}
                >
                  Ver imóveis
                </span>
                <span className="rounded-md bg-white/90 px-3 py-1.5 text-[11px] font-semibold text-slate-800">
                  Falar agora
                </span>
              </div>
            </div>

            {/* cards de imóveis */}
            <div className={cn('grid gap-3 p-4', device === 'mobile' ? 'grid-cols-1' : 'grid-cols-3')}>
              {[0, 1, 2].slice(0, device === 'mobile' ? 1 : 3).map((i) => (
                <div key={i} className="overflow-hidden rounded-md border border-black/5">
                  <div className="aspect-[4/3] bg-slate-200" />
                  <div className="flex flex-col gap-1 p-2">
                    <span className="text-[11px] font-semibold" style={{ fontFamily: heading, color: branding.secondaryColor }}>
                      Imóvel exemplo
                    </span>
                    <span className="text-[11px] font-bold" style={{ color: branding.brandColor }}>
                      R$ 2.500/mês
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* rodapé */}
            <div className="px-4 py-3 text-[10px] text-white" style={{ backgroundColor: branding.secondaryColor }}>
              <span style={{ fontFamily: heading }} className="font-semibold">
                {orgName}
              </span>
              <p className="mt-0.5 text-white/70" style={{ fontFamily: body }}>
                {branding.whatsapp || branding.phone || 'Contato da imobiliária'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
