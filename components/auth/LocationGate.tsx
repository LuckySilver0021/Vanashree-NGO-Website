'use client'

import { type ReactNode, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { LocationPopup } from '@/components/auth/LocationPopup'

const MIN_LAT = -90
const MAX_LAT = 90
const MIN_LNG = -180
const MAX_LNG = 180
const COORD_PRECISION = 6

const isInRange = (value: number, min: number, max: number) =>
  Number.isFinite(value) && value >= min && value <= max

const roundCoord = (value: number) => Number(value.toFixed(COORD_PRECISION))

/**
 * Asks the user for their location on every fresh entry to the map,
 * regardless of how they got here (guest session, existing account, or
 * newly created account). The answer is written to the URL as `lat`/`lng`
 * so the map has a single source of truth for centring.
 *
 * The `asked` state is intentionally mount-local: it guarantees the prompt
 * appears exactly once per visit while never looping, and resets on the
 * next entry (refresh, back/forward navigation, or a new SPA visit) so the
 * question is genuinely asked every single time.
 */
export function LocationGate({ children }: { children: ReactNode }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [asked, setAsked] = useState(false)
  const [show, setShow] = useState(false)

  const lat = Number.parseFloat(searchParams.get('lat') ?? '')
  const lng = Number.parseFloat(searchParams.get('lng') ?? '')
  const hasCoords = isInRange(lat, MIN_LAT, MAX_LAT) && isInRange(lng, MIN_LNG, MAX_LNG)

  useEffect(() => {
    if (hasCoords) {
      // A precise location is already provided — nothing to ask.
      setAsked(true)
      setShow(false)
      return
    }

    if (!asked) {
      setShow(true)
    }
  }, [hasCoords, asked])

  const handleAllow = (latitude: number, longitude: number) => {
    setAsked(true)
    setShow(false)
    router.replace(
      `/maps?lat=${roundCoord(latitude)}&lng=${roundCoord(longitude)}`,
      { scroll: false },
    )
  }

  const handleDecline = () => {
    setAsked(true)
    setShow(false)
  }

  return (
    <>
      {children}
      <LocationPopup open={show} onAllow={handleAllow} onDecline={handleDecline} />
    </>
  )
}
