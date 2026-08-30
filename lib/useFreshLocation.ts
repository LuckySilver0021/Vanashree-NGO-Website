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


let denied = false
let inflight: Promise<FreshLocation | null> | null = null

export function requestLocationNow(): Promise<FreshLocation | null> {
  if (inflight) return inflight
  if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
    return Promise.resolve(null)
  }

  inflight = new Promise<FreshLocation | null>((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (result) => {
        const { latitude, longitude } = result.coords
        if (!isInRange(latitude, MIN_LAT, MAX_LAT) || !isInRange(longitude, MIN_LNG, MAX_LNG)) {
          resolve(null)
          return
        }
        resolve({ lat: roundCoord(latitude), lng: roundCoord(longitude) })
      },
      () => {
        denied = true
        resolve(null)
      },
      GEOLOCATION_OPTIONS,
    )
  }).finally(() => {
    inflight = null
  })

  return inflight
}

/**
 * - StrictMode-safe: the cleanup ignores stale callbacks after unmount.
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
    let cancelled = false

    requestLocationNow().then((location) => {
      if (cancelled) return
      if (location) {
        setPosition(location)
        setStatus('granted')
      } else {
        setStatus(denied ? 'denied' : 'unavailable')
      }
    })

    return () => {
      cancelled = true
    }
  }, [])

  return { position, status }
}