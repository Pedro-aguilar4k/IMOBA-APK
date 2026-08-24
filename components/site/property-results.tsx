'use client'

import { useState } from 'react'
import { MapPropertyPanel } from '@/components/site/map-property-panel'
import { PropertyCard } from '@/components/site/property-card'
import { PropertyMap } from '@/components/site/property-map'
import type { SiteProperty } from '@/lib/site/site-data'

export function PropertyResults({ properties, baseHref }: { properties: SiteProperty[]; baseHref: string }) {
  const [selectedId, setSelectedId] = useState<string>()
  const selected = properties.find((property) => property.id === selectedId)

  function selectProperty(property: SiteProperty) {
    setSelectedId(property.id)
  }

  const cards = (
    <div className="grid content-start gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {properties.map((property) => (
        <div
          key={property.id}
          onClickCapture={(event) => {
            event.preventDefault()
            selectProperty(property)
          }}
          className={`cursor-pointer rounded-xl transition-shadow ${property.id === selectedId ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}
        >
          <PropertyCard property={property} baseHref={baseHref} compact />
        </div>
      ))}
    </div>
  )

  return (
    <div className="mt-5 transition-[min-height] duration-500 ease-out">
      {selected ? (
        <div className="flex animate-in flex-col gap-6 fade-in duration-500">
          <div className="grid items-stretch gap-5 lg:grid-cols-[minmax(0,1.65fr)_minmax(20rem,0.75fr)]">
            <div className="h-[28rem] overflow-hidden rounded-2xl border border-border bg-muted shadow-sm lg:h-[34rem]">
              <PropertyMap properties={properties} selectedId={selectedId} onSelect={selectProperty} />
            </div>
            <MapPropertyPanel property={selected} baseHref={baseHref} onClose={() => setSelectedId(undefined)} />
          </div>

          <section aria-labelledby="available-properties-title">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-primary">Imóveis disponíveis</p>
                <h2 id="available-properties-title" className="font-display text-2xl font-semibold text-foreground">
                  Continue explorando
                </h2>
              </div>
              <p className="text-sm text-muted-foreground">{properties.length} imóveis</p>
            </div>
            {cards}
          </section>
        </div>
      ) : (
        <div className="grid items-start gap-5 lg:grid-cols-[minmax(28rem,0.9fr)_minmax(34rem,1.1fr)] xl:grid-cols-[minmax(34rem,0.92fr)_minmax(42rem,1.08fr)]">
          <div className="grid content-start gap-4 sm:grid-cols-2">{properties.map((property) => (
            <div
              key={property.id}
              onClickCapture={(event) => {
                event.preventDefault()
                selectProperty(property)
              }}
              className="cursor-pointer rounded-xl transition-shadow"
            >
              <PropertyCard property={property} baseHref={baseHref} compact />
            </div>
          ))}</div>
          <div className="order-first h-[28rem] overflow-hidden rounded-2xl border border-border bg-muted shadow-sm lg:order-none lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)] lg:min-h-[38rem]">
            <PropertyMap properties={properties} onSelect={selectProperty} />
          </div>
        </div>
      )}
    </div>
  )
}
