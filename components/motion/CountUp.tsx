'use client'

import { useEffect, useRef, useState } from 'react'
import { useInView, useReducedMotion } from 'framer-motion'

interface CountUpProps {
  target: number
  prefix?: string
  suffix?: string
  duration?: number
}

export function CountUp({
  target,
  prefix = '',
  suffix = '',
  duration = 1800,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const reduce = useReducedMotion()
  const [count, setCount] = useState(reduce ? target : 0)

  useEffect(() => {
    if (!inView || reduce) {
      setCount(target)
      return
    }

    const start = performance.now()

    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      // easeOutCubic — fast start, gentle land
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * target))

      if (progress < 1) {
        requestAnimationFrame(step)
      } else {
        setCount(target)
      }
    }

    requestAnimationFrame(step)
  }, [inView, target, duration, reduce])

  return (
    <span ref={ref}>
      {prefix}
      {count.toLocaleString('en-IN')}
      {suffix}
    </span>
  )
}
