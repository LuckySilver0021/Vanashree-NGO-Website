'use client'

import { type ReactNode, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

const MIN_LAT = -90
const MAX_LAT = 90
const MIN_LNG = -180
const MAX_LNG = 180
const COORD_PRECISION = 6

const isInRange = (value: number, min: number, max: number) =>
  Number.isFinite(value) && value >= min && value <= max

const roundCoord = (value: number) => Number(value.toFixed(COORD_PRECISION))

// maximumAge: 0 guarantees a fresh GPS fix on every request — the
// browser is never allowed to reuse a previously cached position.
const GEOLOCATION_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 15000,
  maximumAge: 0,
}

/**
 * Requests the user's location on EVERY fresh entry to the map — no
 * custom UI widget, only the browser's native site-permission dialog.
 *
 * The request is made unconditionally on each mount:
 * - first-ever visit  → the browser shows its native permission prompt,
 * - previously granted → the browser answers silently with the position
 *   immediately (each granted visit still re-centres the map on it),
 * - previously blocked → the browser rejects the call on its own; we
 *   cannot override an OS/browser-level "blocked" decision.
 *
 * No location is ever cached: `maximumAge: 0` forces the browser to
 * acquire a fresh fix, and the coordinates are only held in the URL for
 * the duration of this visit. Each grant writes `lat`/`lng` to the URL,
 * which stays the single source of truth for the map's centring logic.
 */
export function LocationGate({ children }: { children: ReactNode }) {
  const router = useRouter()

  // Mount-local guard: exactly one geolocation attempt per visit and no
  // double-fire under React StrictMode dev double-mounting. The browser
  // itself re-asks on the next entry (fresh mount).
  const requestedRef = useRef(false)

  useEffect(() => {
    if (requestedRef.current) return
    requestedRef.current = true

    if (!('geolocation' in navigator)) return

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        if (!isInRange(latitude, MIN_LAT, MAX_LAT) || !isInRange(longitude, MIN_LNG, MAX_LNG)) return
        router.replace(
          `/maps?lat=${roundCoord(latitude)}&lng=${roundCoord(longitude)}`,
          { scroll: false },
        )
      },
      () => {
        // Denied or unavailable — the map keeps its default view.
      },
      GEOLOCATION_OPTIONS,
    )
  }, [router])

  return <>{children}</>
}