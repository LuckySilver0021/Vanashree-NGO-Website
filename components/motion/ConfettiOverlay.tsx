'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Particle {
  id: number
  x: number
  y: number
  color: string
  rotation: number
  scale: number
  shape: 'circle' | 'square' | 'leaf'
}

interface ConfettiOverlayProps {
  message: string
  type?: 'success' | 'error'
  onComplete?: () => void
  duration?: number
}

const COLORS = {
  success: ['#4A7C2F', '#6B9E47', '#A8C57A', '#C8A051', '#D4A843', '#1C3B0F'],
  error: ['#B8704A', '#C8A051', '#D4A843', '#E8EDE0', '#4A7C2F', '#6B9E47'],
}

const SHAPES: Particle['shape'][] = ['circle', 'square', 'leaf']

export function ConfettiOverlay({
  message,
  type = 'success',
  onComplete,
  duration = 4000,
}: ConfettiOverlayProps) {
  const [particles, setParticles] = useState<Particle[]>([])
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const p: Particle[] = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -10 - Math.random() * 20,
      color: COLORS[type][Math.floor(Math.random() * COLORS[type].length)],
      rotation: Math.random() * 360,
      scale: 0.4 + Math.random() * 0.8,
      shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
    }))
    setParticles(p)

    const timer = setTimeout(() => {
      setVisible(false)
      onComplete?.()
    }, duration)

    return () => clearTimeout(timer)
  }, [type, duration, onComplete])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Particles */}
          {particles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute"
              initial={{
                x: `${p.x}vw`,
                y: `${p.y}vh`,
                rotate: p.rotation,
                scale: 0,
                opacity: 1,
              }}
              animate={{
                y: ['-10vh', '30vh', '70vh', '110vh'],
                x: [`${p.x}vw`, `${p.x + (Math.random() - 0.5) * 20}vw`, `${p.x + (Math.random() - 0.5) * 30}vw`, `${p.x + (Math.random() - 0.5) * 15}vw`],
                rotate: [p.rotation, p.rotation + 360, p.rotation + 720],
                scale: [0, p.scale, p.scale * 0.8, 0],
                opacity: [1, 1, 0.8, 0],
              }}
              transition={{
                duration: 2.5 + Math.random() * 1.5,
                ease: [0.25, 0.46, 0.45, 0.94],
                times: [0, 0.3, 0.7, 1],
              }}
            >
              {p.shape === 'circle' ? (
                <div
                  className="rounded-full"
                  style={{
                    width: 8 + Math.random() * 8,
                    height: 8 + Math.random() * 8,
                    backgroundColor: p.color,
                  }}
                />
              ) : p.shape === 'leaf' ? (
                <div
                  style={{
                    width: 6 + Math.random() * 6,
                    height: 12 + Math.random() * 8,
                    backgroundColor: p.color,
                    borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                    transform: `rotate(${Math.random() * 60 - 30}deg)`,
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 6 + Math.random() * 6,
                    height: 6 + Math.random() * 6,
                    backgroundColor: p.color,
                    borderRadius: 2,
                  }}
                />
              )}
            </motion.div>
          ))}

          {/* Message */}
          <motion.div
            className="relative z-10 bg-white/90 backdrop-blur-md rounded-2xl px-8 py-5 shadow-2xl border border-moss/20 text-center"
            initial={{ scale: 0, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: -20 }}
            transition={{ type: 'spring', damping: 15, stiffness: 200 }}
          >
            <p
              className={`text-lg font-bold ${
                type === 'success' ? 'text-forest' : 'text-terracotta'
              }`}
            >
              {message}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
