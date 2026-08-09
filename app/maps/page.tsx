import { Suspense } from 'react'
import MapsClient from './MapsClient'
import { LocationGate } from '@/components/auth/LocationGate'

export default function MapsPage() {
  return (
    <Suspense fallback={null}>
      <LocationGate>
        <MapsClient />
      </LocationGate>
    </Suspense>
  )
}
