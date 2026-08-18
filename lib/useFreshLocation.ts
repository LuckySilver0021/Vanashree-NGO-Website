'use client'

import { useEffect, useState } from 'react'

export interface FreshLocation {
  lat: number
  lng: number
}

export type LocationStatus = 'idle' | 'requesting' | 'granted' | 'denied' | 'unavailable'

const MIN_LAT = -90
const MAX_LAT = 90
const MIN_LNG = -180
const MAX_LNG = 180
const COORD_PRECISION = 6


const GEOLOCATION_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 15000,
  maximumAge: 0,
}

const isInRange = (value: number, min: number, max: number) =>
  Number.isFinite(value) && value >= min && value <= max

const roundCoord = (value: number) => Number(value.toFixed(COORD_PRECISION))

/**
 * Requests the user's location exactly once per mount (i.e. once per page
 * load / reload) and never caches or persists it.
 *
 * - `maximumAge: 0` forces the browser to acquire a fresh fix instead of
 *   answering from its internal position cache.
 * - The request is intentionally re-issued on every page load, so a reload
 *   always re-asks and re-centres on the current position.
 * - A previously granted permission answers silently with a fresh fix; a
 *   previously blocked permission is rejected by the browser itself and
 *   cannot be overridden from the page (change it in browser settings).
 * - StrictMode-safe: the cleanup cancels a stale in-flight request so a
 *   dev double-mount always ends with exactly one live request.
 *
 * Returns `{ position, status }`. `position` is `null` until granted.
 */
export function useFreshLocation(): {
  position: FreshLocation | null
  status: LocationStatus
} {
  const [position, setPosition] = useState<FreshLocation | null>(null)
  // Derive the initial status during state init so no setState is needed
  // inside the effect body (keeps effects cascading-render-free).
  const [status, setStatus] = useState<LocationStatus>(() =>
    typeof navigator !== 'undefined' && 'geolocation' in navigator ? 'requesting' : 'unavailable',
  )

  useEffect(() => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) return

    let cancelled = false

    navigator.geolocation.getCurrentPosition(
      (result) => {
        if (cancelled) return
        const { latitude, longitude } = result.coords
        if (!isInRange(latitude, MIN_LAT, MAX_LAT) || !isInRange(longitude, MIN_LNG, MAX_LNG)) {
          setStatus('unavailable')
          return
        }
        setPosition({ lat: roundCoord(latitude), lng: roundCoord(longitude) })
        setStatus('granted')
      },
      () => {
        if (!cancelled) setStatus('denied')
      },
      GEOLOCATION_OPTIONS,
    )

    return () => {
      cancelled = true
    }
  }, [])

  return { position, status }
}