'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { IconMapPin, IconLoader2, IconCrosshair } from '@tabler/icons-react'

interface LocationPopupProps {
  open: boolean
  onAllow: (lat: number, lng: number) => void
  onDecline: () => void
}

export function LocationPopup({ open, onAllow, onDecline }: LocationPopupProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleAllow = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not available in your browser.')
      return
    }
    setLoading(true)
    setError('')

    navigator.geolocation.getCurrentPosition(
      (position) => {
        onAllow(position.coords.latitude, position.coords.longitude)
      },
      (err) => {
        setLoading(false)
        if (err.code === err.PERMISSION_DENIED) {
          onDecline()
        } else {
          setError('Could not retrieve your location. Please try again.')
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    )
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <motion.div
            className="relative w-full max-w-md overflow-hidden rounded-[32px] border border-white/20 bg-white shadow-[0_32px_80px_rgba(0,0,0,0.35)]"
            initial={{ scale: 0.92, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 24 }}
            transition={{ type: 'spring', damping: 22, stiffness: 260 }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,197,122,0.12),transparent_50%),radial-gradient(circle_at_bottom_left,rgba(200,160,81,0.08),transparent_50%)]" />

            <div className="relative px-6 pb-6 pt-8 sm:px-8 sm:pb-8 sm:pt-10">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-leaf/15">
                <IconMapPin size={28} className="text-leaf" />
              </div>

              <h2 className="text-center text-xl font-bold text-forest">Share your location</h2>
              <p className="mt-2 text-center text-sm leading-relaxed text-stone">
                We'll centre the map on your current location so you can see nearby saplings and start exploring right away.
              </p>

              <div className="mt-3 flex items-center justify-center gap-2 rounded-2xl bg-cream/60 px-4 py-2.5 text-xs text-pebble">
                <IconCrosshair size={14} className="shrink-0 text-leaf" />
                Your location is never stored or shared — it's only used to position the map.
              </div>

              {error && (
                <p className="mt-3 text-center text-sm text-red-500">{error}</p>
              )}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleAllow}
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-leaf px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-leaf/20 transition-all hover:bg-forest disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:flex-1"
                >
                  {loading ? (
                    <>
                      <IconLoader2 size={16} className="animate-spin" /> Locating…
                    </>
                  ) : (
                    <>
                      <IconMapPin size={16} /> Allow location
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={onDecline}
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center rounded-2xl border border-stone-200 bg-white px-5 py-3 text-sm font-medium text-stone transition-all hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:flex-1"
                >
                  Maybe later
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
