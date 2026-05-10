'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import Image from 'next/image'

interface TreeLoaderProps {
  onComplete?: () => void
}

export function TreeLoader({ onComplete }: TreeLoaderProps) {
  const [done, setDone] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => {
      setDone(true)
      onComplete?.()
    }, 2600)
    return () => clearTimeout(t)
  }, [onComplete])

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-cream"
      animate={done ? { opacity: 0 } : { opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      style={{ pointerEvents: done ? 'none' : 'all' }}
      aria-hidden="true"
    >
      {/*
        The logo background is the same cream colour as this loader bg,
        so it blends seamlessly. We reveal the image from bottom->top using
        clipPath inset, making the tree literally grow up from the ground.
        inset(100% 0 0 0) = nothing visible (top edge clipped to very bottom)
        inset(0 0 0 0)    = fully visible
        The easing: slow start (roots emerge) -> fast middle (trunk shoots up)
        -> gentle settle (leaves unfurl at top). Matches natural tree growth.
      */}
      <div className="relative w-[160px] h-[160px]">
        {/* Ghost — faint silhouette so the space doesn't look empty */}
        <Image
          src="/images/logo/logo.png"
          alt=""
          width={160}
          height={160}
          priority
          className="select-none opacity-10"
          aria-hidden="true"
        />
        {/* Grow reveal */}
        <motion.div
          className="absolute inset-0 overflow-hidden"
          initial={{ clipPath: 'inset(100% 0% 0% 0%)' }}
          animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
          transition={{
            duration: 2.0,
            ease: [0.12, 0.8, 0.35, 1.0],
          }}
        >
          <Image
            src="/images/logo/logo.png"
            alt="Vanashree"
            width={160}
            height={160}
            priority
            className="select-none"
          />
        </motion.div>
      </div>

      {/* Progress bar — synced to the same grow timing */}
      <div className="mt-5 w-32 h-[3px] rounded-full bg-moss/20 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-leaf to-moss rounded-full"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 2.0, ease: [0.12, 0.8, 0.35, 1.0] }}
        />
      </div>
    </motion.div>
  )
}