'use client'

import { useEffect } from 'react'
import { RotateCcw } from 'lucide-react'

/**
 * Trava o app em modo retrato.
 *
 * 1. Em apps nativos empacotados (Capacitor/PWA instalado) tenta a
 *    Screen Orientation API para bloquear de fato a rotação.
 * 2. Em navegadores que não permitem o lock (Safari iOS, abas comuns)
 *    o overlay abaixo cobre a tela em landscape pedindo para girar de volta.
 */
export function OrientationLock() {
  useEffect(() => {
    const orientation = window.screen?.orientation as
      | (ScreenOrientation & { lock?: (o: string) => Promise<void> })
      | undefined

    if (orientation?.lock) {
      // Alguns navegadores rejeitam a Promise quando não estão em fullscreen.
      void orientation.lock('portrait').catch(() => {})
    }

    return () => {
      window.screen?.orientation?.unlock?.()
    }
  }, [])

  return (
    <div
      aria-hidden="true"
      className="landscape-lock fixed inset-0 z-[9999] hidden flex-col items-center justify-center gap-4 bg-background px-8 text-center"
    >
      <RotateCcw className="size-12 text-primary" aria-hidden="true" />
      <p className="text-balance text-lg font-semibold text-foreground">
        Gire o dispositivo para o modo retrato
      </p>
      <p className="text-pretty text-sm text-muted-foreground">
        Este aplicativo foi feito para ser usado na vertical.
      </p>
    </div>
  )
}
