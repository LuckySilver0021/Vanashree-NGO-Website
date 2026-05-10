import { FadeIn } from '@/components/motion/FadeIn'
import { Badge } from '@/components/ui/badge'

interface PageHeaderProps {
  eyebrow: string
  title: string
  description?: string
}

export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <section className="relative pt-32 pb-16 md:pt-40 md:pb-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-forest via-canopy to-forest" />
      {/* Warm glow */}
      <div className="absolute bottom-0 right-0 w-[500px] h-[300px] rounded-full bg-gold/5 blur-3xl" />
      <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-6 text-center">
        <FadeIn>
          <Badge className="mb-5 bg-gold/15 text-gold border-gold/25 px-4 py-1.5 text-xs font-medium tracking-wide backdrop-blur-sm">
            {eyebrow}
          </Badge>
        </FadeIn>
        <FadeIn delay={0.1}>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight tracking-tight">
            {title}
          </h1>
        </FadeIn>
        {description && (
          <FadeIn delay={0.2}>
            <p className="mt-5 text-white/70 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
              {description}
            </p>
          </FadeIn>
        )}
      </div>
    </section>
  )
}
