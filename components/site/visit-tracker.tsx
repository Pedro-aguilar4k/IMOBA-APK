'use client'

import { useEffect, useRef } from 'react'
import { trackVisit } from '@/app/(site)/site/[slug]/actions'

function detectDevice(): string {
  if (typeof window === 'undefined') return 'desktop'
  const w = window.innerWidth
  if (w < 640) return 'mobile'
  if (w < 1024) return 'tablet'
  return 'desktop'
}

export function VisitTracker({ organizationId, path }: { organizationId: string; path: string }) {
  const sent = useRef(false)
  useEffect(() => {
    if (sent.current) return
    sent.current = true
    void trackVisit(organizationId, path, detectDevice())
  }, [organizationId, path])
  return null
}
