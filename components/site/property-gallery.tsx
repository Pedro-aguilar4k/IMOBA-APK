'use client'

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

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-muted">
        <Image
          src={gallery[active] || '/placeholder.svg'}
          alt={`${title} — foto ${active + 1}`}
          fill
          sizes="(max-width: 1024px) 100vw, 800px"
          className="object-cover"
          priority
        />
      </div>
      {gallery.length > 1 && (
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
          {gallery.map((src, index) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Ver foto ${index + 1}`}
              aria-current={index === active}
              className={cn(
                'relative aspect-square overflow-hidden rounded-lg border-2 transition',
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
