'use client'

import { useState } from 'react'
import { PropertyCard } from '@/components/site/property-card'
import { PropertyMap } from '@/components/site/property-map'
import type { SiteProperty } from '@/lib/site/site-data'

export function PropertyResults({ properties, baseHref }: { properties: SiteProperty[]; baseHref: string }) {
  const [selectedId, setSelectedId] = useState<string>()
  const selected = properties.find((property) => property.id === selectedId)

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(28rem,1.05fr)]">
      <div className="grid content-start gap-6 sm:grid-cols-2 lg:max-h-[calc(100vh-17rem)] lg:overflow-y-auto lg:pr-2">
        {properties.map((property) => (
          <div key={property.id} onMouseEnter={() => setSelectedId(property.id)} onFocus={() => setSelectedId(property.id)}>
            <PropertyCard property={property} baseHref={baseHref} />
          </div>
        ))}
      </div>
      <div className="sticky top-4 hidden h-[calc(100vh-9rem)] overflow-hidden rounded-2xl border border-border bg-muted shadow-sm lg:block">
        <PropertyMap properties={properties} selectedId={selectedId} onSelect={(property) => setSelectedId(property.id)} />
        {selected ? <p className="pointer-events-none absolute bottom-5 left-5 max-w-[18rem] rounded-xl bg-card/95 px-4 py-3 text-sm text-foreground shadow-lg">{selected.title}</p> : null}
      </div>
      <div className="h-[28rem] overflow-hidden rounded-2xl border border-border bg-muted lg:hidden">
        <PropertyMap properties={properties} selectedId={selectedId} onSelect={(property) => setSelectedId(property.id)} />
      </div>
    </div>
  )
}
