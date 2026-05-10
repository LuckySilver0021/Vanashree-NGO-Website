'use client'

import { FadeIn } from '@/components/motion/FadeIn'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { IconArrowRight } from '@tabler/icons-react'
import type { ReactNode } from 'react'

interface CTASectionProps {
  title: string
  body: string
  primaryLabel: string
  primaryHref: string
  secondaryLabel?: string
  secondaryHref?: string
  icon?: ReactNode
}

export function CTASection({
  title,
  body,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
  icon,
}: CTASectionProps) {
  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      {/* Gradient background with warm accent */}
      <div className="absolute inset-0 bg-gradient-to-br from-forest via-canopy to-forest" />
      {/* Decorative warm glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-gold/5 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-leaf/10 blur-3xl" />

      <div className="max-w-3xl mx-auto px-4 md:px-6 text-center relative z-10">
        <FadeIn>
          {icon && (
            <div className="w-16 h-16 rounded-full bg-gold/15 backdrop-blur-sm flex items-center justify-center mx-auto mb-6 border border-gold/20">
              {icon}
            </div>
          )}
          <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight">
            {title}
          </h2>
          <p className="mt-5 text-white/70 text-base md:text-lg leading-relaxed max-w-xl mx-auto">
            {body}
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-gold hover:bg-amber text-forest font-bold rounded-full px-8 h-12 shadow-lg shadow-gold/20 transition-all duration-300"
            >
              <Link href={primaryHref}>
                {primaryLabel}
                <IconArrowRight size={16} className="ml-2" />
              </Link>
            </Button>
            {secondaryLabel && secondaryHref && (
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-2 border-white/25 text-white hover:bg-white/10 font-semibold rounded-full px-8 h-12 bg-transparent backdrop-blur-sm transition-all duration-300"
              >
                <Link href={secondaryHref}>{secondaryLabel}</Link>
              </Button>
            )}
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
