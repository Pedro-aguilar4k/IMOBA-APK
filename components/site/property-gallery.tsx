'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface PropertyGalleryProps {
  images: string[]
  title: string
}

export function PropertyGallery({ images, title }: PropertyGalleryProps) {
  const gallery = images.length > 0 ? images : ['/diverse-property-showcase.png']
  const [active, setActive] = useState(0)

  function showPreviousImage() {
    setActive((current) => (current - 1 + gallery.length) % gallery.length)
  }

  function showNextImage() {
    setActive((current) => (current + 1) % gallery.length)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-muted sm:aspect-[16/10] sm:rounded-2xl">
        <Image
          src={gallery[active] || '/placeholder.svg'}
          alt={`${title} — foto ${active + 1}`}
          fill
          sizes="(max-width: 1024px) 100vw, 800px"
          className="object-cover"
          priority
        />
        {gallery.length > 1 && (
          <>
            <button
              type="button"
              onClick={showPreviousImage}
              className="absolute left-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm transition hover:bg-background sm:left-4 sm:size-11"
              aria-label="Ver foto anterior"
            >
              <ChevronLeft aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={showNextImage}
              className="absolute right-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm transition hover:bg-background sm:right-4 sm:size-11"
              aria-label="Ver próxima foto"
            >
              <ChevronRight aria-hidden="true" />
            </button>
            <span className="absolute bottom-3 right-3 rounded-full bg-foreground/75 px-3 py-1.5 text-xs font-medium text-background sm:bottom-4 sm:right-4" aria-live="polite">
              {active + 1} / {gallery.length}
            </span>
          </>
        )}
      </div>
      {gallery.length > 1 && (
        <div className="flex snap-x gap-2 overflow-x-auto pb-1 sm:grid sm:grid-cols-5 sm:gap-3 sm:overflow-visible sm:pb-0">
          {gallery.map((src, index) => (
            <button
              key={`${src}-${index}`}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Ver foto ${index + 1}`}
              aria-current={index === active}
              className={cn(
                'relative aspect-square w-18 shrink-0 snap-start overflow-hidden rounded-lg border-2 transition sm:w-auto',
                index === active
                  ? 'border-primary'
                  : 'border-transparent opacity-70 hover:opacity-100',
              )}
            >
              <Image
                src={src || '/placeholder.svg'}
                alt=""
                fill
                sizes="120px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
