'use client'

import { useRef, useState } from 'react'
import { MapPropertyPanel } from '@/components/site/map-property-panel'
import { PropertyCard } from '@/components/site/property-card'
import { PropertyMap } from '@/components/site/property-map'
import type { SiteProperty } from '@/lib/site/site-data'

export function PropertyResults({ properties, baseHref }: { properties: SiteProperty[]; baseHref: string }) {
  const [selectedId, setSelectedId] = useState<string>()
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const selected = properties.find((property) => property.id === selectedId)

  function selectProperty(property: SiteProperty, scrollToCard = false) {
    setSelectedId(property.id)
    if (scrollToCard) {
      requestAnimationFrame(() => {
        cardRefs.current[property.id]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      })
    }
  }

  return (
    <div className="mt-5 grid items-start gap-5 lg:grid-cols-[minmax(28rem,0.88fr)_minmax(34rem,1.12fr)] xl:grid-cols-[minmax(34rem,0.92fr)_minmax(42rem,1.08fr)]">
      <div className="grid content-start gap-4 sm:grid-cols-2">
        {properties.map((property) => (
          <div
            key={property.id}
            ref={(element) => { cardRefs.current[property.id] = element }}
            onMouseEnter={() => setSelectedId(property.id)}
            onFocus={() => setSelectedId(property.id)}
            onClick={() => setSelectedId(property.id)}
            className={`rounded-xl transition-shadow ${property.id === selectedId ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}
          >
            <PropertyCard property={property} baseHref={baseHref} compact />
          </div>
        ))}
      </div>

      <div className="order-first h-[28rem] overflow-hidden rounded-2xl border border-border bg-muted shadow-sm lg:order-none lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)] lg:min-h-[38rem]">
        <PropertyMap
          properties={properties}
          selectedId={selectedId}
          onSelect={(property) => selectProperty(property, true)}
        />
        {selected ? (
          <MapPropertyPanel property={selected} baseHref={baseHref} onClose={() => setSelectedId(undefined)} />
        ) : null}
      </div>
    </div>
  )
}
