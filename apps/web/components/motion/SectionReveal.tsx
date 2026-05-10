'use client'

import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'

interface SectionRevealProps {
  eyebrow?: string
  heading: string
  sub?: string
  children?: ReactNode
  center?: boolean
}

export function SectionReveal({
  eyebrow,
  heading,
  sub,
  children,
  center = false,
}: SectionRevealProps) {
  const reduce = useReducedMotion()

  const fadeProps = reduce
    ? {}
    : {
        initial: { opacity: 0, y: 16 } as const,
        whileInView: { opacity: 1, y: 0 } as const,
        viewport: { once: true } as const,
      }

  return (
    <div className={center ? 'text-center' : ''}>
      {eyebrow && (
        <motion.p
          {...fadeProps}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0 }}
          className="text-leaf text-sm font-semibold uppercase tracking-widest mb-3"
        >
          {eyebrow}
        </motion.p>
      )}

      <motion.h2
        {...fadeProps}
        transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
        className="text-2xl md:text-4xl font-bold text-forest leading-snug mb-4"
      >
        {heading}
      </motion.h2>

      {sub && (
        <motion.p
          {...fadeProps}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
          className={`text-stone text-base md:text-lg leading-relaxed ${
            center ? 'max-w-2xl mx-auto' : 'max-w-2xl'
          }`}
        >
          {sub}
        </motion.p>
      )}

      {children}
    </div>
  )
}
