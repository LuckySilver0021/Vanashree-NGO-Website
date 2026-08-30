'use client'

import { useEffect, useRef, useState } from 'react'
import { IconLoader2, IconMapPin } from '@tabler/icons-react'

interface UserLocationMapProps {
  itemLocation: string
  lat?: number | null
  lng?: number | null
}

const NO_INTERSECTION_OBSERVER = typeof IntersectionObserver === 'undefined'

export function UserLocationMap({ itemLocation, lat, lng }: UserLocationMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState<boolean>(() => NO_INTERSECTION_OBSERVER)

  useEffect(() => {
    if (NO_INTERSECTION_OBSERVER) return
    const el = containerRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true)
            observer.disconnect()
            break
          }
        }
      },
      { rootMargin: '300px 0px' }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const hasCoords = lat != null && lng != null
  const query = hasCoords ? `${lat},${lng}` : encodeURIComponent(itemLocation)
  const src = `https://maps.google.com/maps?q=${query}&z=${hasCoords ? 13 : 12}&output=embed`

  return (
    <div
      ref={containerRef}
      className="rounded-2xl border border-[#e6e2d3] bg-white/70 p-4 shadow-sm"
    >
      <div className="mb-2 flex items-center gap-2">
        <IconMapPin className="h-4 w-4 text-[#b3322c]" stroke={2.2} />
        <h3 className="text-sm font-semibold text-[#37422f]">Location</h3>
      </div>
      <div className="relative h-48 w-full overflow-hidden rounded-xl border border-[#e6e2d3] bg-cream/60">
        {inView ? (
          <iframe
            title="Location map"
            src={src}
            className="h-full w-full"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center gap-2 text-xs text-pebble">
            <IconLoader2 size={14} className="animate-spin" />
            Loading map…
          </div>
        )}
      </div>
      <p className="mt-2 text-xs text-[#7c8468]">Pickup area: {itemLocation}</p>
    </div>
  )
}