'use client'

import { useState, useCallback, useEffect } from 'react'
import { TreeLoader } from '@/components/motion/TreeLoader'

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const [loaded, setLoaded] = useState(false)

  // Only run loader on client — prevents SSR/client HTML mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleComplete = useCallback(() => {
    setLoaded(true)
  }, [])

  // SSR & pre-mount: render children normally (no hidden wrapper)
  if (!mounted) {
    return <>{children}</>
  }

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
