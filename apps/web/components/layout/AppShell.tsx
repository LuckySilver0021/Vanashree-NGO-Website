'use client'

import { useState, useCallback } from 'react'
import { TreeLoader } from '@/components/motion/TreeLoader'

export function AppShell({ children }: { children: React.ReactNode }) {
  const [loaded, setLoaded] = useState(false)

  const handleComplete = useCallback(() => {
    setLoaded(true)
  }, [])

  return (
    <>
      {!loaded && <TreeLoader onComplete={handleComplete} />}
      {/* visibility:hidden keeps content in DOM for SEO — crawlers still read it */}
      <div style={{ visibility: loaded ? 'visible' : 'hidden' }}>
        {children}
      </div>
    </>
  )
}
