'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ConfettiOverlay } from '@/components/motion/ConfettiOverlay'

export function UserNotFoundHandler() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (searchParams.get('userNotFound') === 'true') {
      setShow(true)
    }
  }, [searchParams])

  const handleComplete = () => {
    setShow(false)
    router.replace('/', { scroll: false })
  }

  if (!show) return null

  return (
    <ConfettiOverlay
      message="This user doesn't exist!"
      type="error"
      duration={3500}
      onComplete={handleComplete}
    />
  )
}
