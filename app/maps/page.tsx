import { Suspense } from 'react'
import MapsClient from './MapsClient'

export default function MapsPage() {
  return (
    <Suspense fallback={null}>
      <MapsClient />
    </Suspense>
  )
}