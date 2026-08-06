'use client'

import { useState } from 'react'

interface GalleryImage {
  id: string
  signedUrl?: string
}

export function PropertyGallery({ images, title }: { images: GalleryImage[]; title: string }) {
  const usable = images.filter((i) => i.signedUrl)
  const [active, setActive] = useState(0)

  if (!usable.length) {
    return (
      <div className="flex aspect-[16/10] w-full items-center justify-center rounded-2xl bg-muted text-sm text-muted-foreground">
        Sem fotos disponíveis
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="aspect-[16/10] w-full overflow-hidden rounded-2xl bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={usable[active].signedUrl || '/placeholder.svg'}
          alt={`${title} — foto ${active + 1}`}
          className="size-full object-cover"
        />
      </div>
      {usable.length > 1 ? (
        <div className="grid grid-cols-5 gap-2 sm:grid-cols-6">
          {usable.map((img, index) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Ver foto ${index + 1}`}
              className={`aspect-square overflow-hidden rounded-lg border-2 transition-colors ${
                index === active ? 'border-[var(--brand)]' : 'border-transparent'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.signedUrl || '/placeholder.svg'} alt="" className="size-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
