'use client'

import { FadeIn } from '@/components/motion/FadeIn'
import { IconTarget, IconEye } from '@tabler/icons-react'

interface MissionVisionCardsProps {
  mission: string
  vision: string
}

export function MissionVisionCards({ mission, vision }: MissionVisionCardsProps) {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <FadeIn>
            <div className="relative bg-gradient-to-br from-petal to-cream rounded-2xl p-8 md:p-10 border border-moss/15 h-full group hover:shadow-lg transition-all duration-500">
              {/* Accent bar */}
              <div className="absolute top-0 left-8 right-8 h-0.5 bg-gradient-to-r from-leaf via-fern to-transparent rounded-b" />
              <div className="w-12 h-12 rounded-xl bg-leaf/10 flex items-center justify-center mb-5 group-hover:bg-leaf/15 transition-colors duration-300">
                <IconTarget size={24} className="text-leaf" />
              </div>
              <h3 className="text-forest font-bold text-xl mb-3">Our Mission</h3>
              <p className="text-stone text-base leading-relaxed">{mission}</p>
            </div>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className="relative bg-gradient-to-br from-sand to-petal rounded-2xl p-8 md:p-10 border border-gold/15 h-full group hover:shadow-lg transition-all duration-500">
              {/* Accent bar */}
              <div className="absolute top-0 left-8 right-8 h-0.5 bg-gradient-to-r from-gold via-amber to-transparent rounded-b" />
              <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center mb-5 group-hover:bg-gold/15 transition-colors duration-300">
                <IconEye size={24} className="text-gold" />
              </div>
              <h3 className="text-forest font-bold text-xl mb-3">Our Vision</h3>
              <p className="text-stone text-base leading-relaxed">{vision}</p>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  )
}
