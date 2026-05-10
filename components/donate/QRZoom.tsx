'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { IconZoomIn, IconX } from '@tabler/icons-react'

export function QRZoom() {
  const [open, setOpen] = useState(false)

  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, close])

  // Lock scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      {/* ─── Thumbnail (clickable) ─── */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative rounded-2xl overflow-hidden shadow-md border border-moss/10 cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
        aria-label="Click to enlarge QR code"
      >
        <Image
          src="/images/qrCode.jpg"
          alt="Vanashree Gramvikas Pratishthan UPI QR Code — Bank of Baroda"
          width={280}
          height={280}
          className="object-cover group-hover:scale-[1.03] transition-transform duration-300"
          priority
        />
        {/* Zoom hint overlay */}
        <span className="absolute inset-0 flex items-center justify-center bg-forest/0 group-hover:bg-forest/30 transition-colors duration-300">
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 backdrop-blur-sm rounded-full p-2.5 shadow-lg">
            <IconZoomIn size={22} className="text-forest" />
          </span>
        </span>
      </button>

      {/* ─── Modal ─── */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="QR code enlarged"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-forest/80 backdrop-blur-sm"
            onClick={close}
          />

          {/* Card */}
          <div className="relative z-10 bg-petal rounded-3xl shadow-2xl overflow-hidden max-w-lg w-full animate-in fade-in zoom-in-95 duration-200">
            {/* Top accent */}
            <div className="h-1 bg-gradient-to-r from-leaf via-gold to-fern" />

            <div className="p-6 flex flex-col items-center gap-4">
              {/* Close button */}
              <button
                type="button"
                onClick={close}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-forest/10 hover:bg-forest/20 text-forest transition-colors"
                aria-label="Close"
              >
                <IconX size={16} />
              </button>

              <p className="text-xs font-semibold text-gold uppercase tracking-widest">
                Scan to Donate
              </p>

              <div className="rounded-2xl overflow-hidden border border-moss/10 shadow-md">
                <Image
                  src="/images/qrCode.jpg"
                  alt="Vanashree Gramvikas Pratishthan UPI QR Code — Bank of Baroda"
                  width={500}
                  height={500}
                  className="object-cover"
                  priority
                />
              </div>

              <p className="text-xs text-pebble text-center leading-relaxed">
                Open any UPI app &amp; point your camera at the QR code
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
