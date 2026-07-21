'use client'

import { motion } from 'framer-motion'

export function PulseDot() {
  return (
    <motion.span
      className="inline-block h-2 w-2 rounded-full bg-red-500"
      animate={{ opacity: [1, 0.2, 1] }}
      transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
    />
  )
}
