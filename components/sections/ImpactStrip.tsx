'use client'

import { FadeIn } from '@/components/motion/FadeIn'
import { CountUp } from '@/components/motion/CountUp'
import { DynamicIcon } from '@/components/ui/icon'
import type { ImpactMetric } from '@/lib/content/mock'

interface ImpactStripProps {
  metrics: ImpactMetric[]
  variant?: 'full' | 'compact'
  theme?: 'dark' | 'light'
}

export function ImpactStrip({ metrics, variant = 'full', theme = 'dark' }: ImpactStripProps) {
  const isLight = theme === 'light'
  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      <div className={`absolute inset-0 ${isLight ? 'bg-cream' : 'bg-gradient-to-br from-forest via-canopy to-forest'}`} />
      {/* Subtle dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `radial-gradient(circle, ${isLight ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.8)'} 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />
      <div className="max-w-6xl mx-auto px-4 md:px-6 relative z-10">
        {variant === 'full' && (
          <FadeIn>
            <div className="text-center mb-12">
              <p className={`text-gold text-sm font-semibold uppercase tracking-widest mb-3`}>
                Real Impact
              </p>
              <h2 className={`text-3xl md:text-5xl font-bold leading-tight ${isLight ? 'text-forest' : 'text-white'}`}>
                Numbers That Tell<br className="hidden md:block" /> Our Story
              </h2>
            </div>
          </FadeIn>
        )}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
          {metrics.map((metric) => (
            <FadeIn key={metric._id} delay={metric.order * 0.08}>
              <div className="text-center group">
                <div
                  className={`${
                    variant === 'full' ? 'w-16 h-16' : 'w-12 h-12'
                  } rounded-2xl ${
                    isLight ? 'bg-gold/10 group-hover:bg-gold/20' : 'bg-white/10 backdrop-blur-sm group-hover:bg-gold/20'
                  } flex items-center justify-center mx-auto mb-4 transition-colors duration-500`}
                >
                  <DynamicIcon
                    name={metric.icon}
                    size={variant === 'full' ? 28 : 22}
                    className="text-gold"
                  />
                </div>
                <p
                  className={`${
                    variant === 'full' ? 'text-4xl md:text-5xl' : 'text-3xl md:text-4xl'
                  } font-bold tracking-tight ${isLight ? 'text-forest' : 'text-white'}`}
                >
                  <CountUp target={metric.value} suffix={metric.suffix} />
                </p>
                <p className="text-gold text-sm font-medium mt-2 uppercase tracking-wide">
                  {metric.label}
                </p>
                {variant === 'full' && metric.sublabel && (
                  <p className={`text-xs mt-1 ${isLight ? 'text-pebble' : 'text-white/40'}`}>{metric.sublabel}</p>
                )}
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
