import type { Metadata } from 'next'
import { getPrograms, getImpactMetrics } from '@/lib/content'
import { PageHeader } from '@/components/layout/PageHeader'
import { FadeIn } from '@/components/motion/FadeIn'
import { ImpactStrip } from '@/components/sections/ImpactStrip'
import { CTASection } from '@/components/sections/CTASection'
import { DynamicIcon } from '@/components/ui/icon'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { IconCheck, IconHandStop } from '@tabler/icons-react'

export const metadata: Metadata = {
  title: 'Our Programs',
  description:
    'Explore Vanashree\'s three pillars — Afforestation, Education & Infrastructure, and Environmental Action — driving sustainable rural development in Maharashtra.',
}

export default async function ProgramsPage() {
  const [programs, metrics] = await Promise.all([
    getPrograms(),
    getImpactMetrics(),
  ])

  const pillarColors = [
    { accent: 'bg-gradient-to-r from-leaf to-fern', iconBg: 'bg-leaf/10', iconColor: 'text-leaf', checkColor: 'text-leaf' },
    { accent: 'bg-gradient-to-r from-gold to-amber', iconBg: 'bg-gold/10', iconColor: 'text-gold', checkColor: 'text-gold' },
    { accent: 'bg-gradient-to-r from-terracotta to-gold', iconBg: 'bg-terracotta/10', iconColor: 'text-terracotta', checkColor: 'text-terracotta' },
  ]

  return (
    <>
      <PageHeader
        eyebrow="Our Programs"
        title="Three Pillars of Change"
        description="Community-driven programmes creating lasting impact across rural Maharashtra"
      />

      {/* ─── Programs Detail ─── */}
      <section className="py-24 md:py-32 bg-white">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <div className="space-y-16 md:space-y-24">
            {programs.map((program, idx) => {
              const colors = pillarColors[idx] || pillarColors[0]
              return (
                <FadeIn key={program._id} delay={idx * 0.05}>
                  <div id={program.slug} className="scroll-mt-24">
                    <div className="flex items-start gap-5">
                      <div className={`w-16 h-16 rounded-xl ${colors.iconBg} flex items-center justify-center shrink-0`}>
                        <DynamicIcon name={program.icon} size={32} className={colors.iconColor} />
                      </div>
                      <div className="flex-1">
                        <Badge variant="outline" className={`${colors.iconColor} border-current/30 text-[10px] font-semibold uppercase tracking-wider mb-3`}>
                          Pillar {program.order}
                        </Badge>
                        <h2 className="text-2xl md:text-3xl font-bold text-forest leading-snug mb-4">
                          {program.title}
                        </h2>
                        <p className="text-stone text-base md:text-lg leading-relaxed">
                          {program.fullDescription}
                        </p>
                        {/* Highlights */}
                        {program.highlights && (
                          <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {program.highlights.map((h) => (
                              <li key={h} className="flex items-start gap-2.5 text-sm text-pebble">
                                <IconCheck size={16} className={`${colors.checkColor} mt-0.5 shrink-0`} />
                                {h}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                    {idx < programs.length - 1 && (
                      <Separator className="mt-16 md:mt-24 bg-moss/15" />
                    )}
                  </div>
                </FadeIn>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── Impact strip ─── */}
      <ImpactStrip metrics={metrics} variant="compact" theme="light" />

      {/* ─── CTA ─── */}
      <CTASection
        title="Want to contribute to our programs?"
        body="Whether you volunteer, donate, or spread the word — every bit counts."
        primaryLabel="Get Involved"
        primaryHref="/contact"
        icon={<IconHandStop size={30} className="text-gold" />}
      />
    </>
  )
}
