import type { Metadata } from 'next'
import { getPageContent, getImpactMetrics } from '@/lib/content'
import { galleryImages } from '@/lib/gallery'
import { PageHeader } from '@/components/layout/PageHeader'
import { FadeIn } from '@/components/motion/FadeIn'
import { ImpactStrip } from '@/components/sections/ImpactStrip'
import { CTASection } from '@/components/sections/CTASection'
import Image from 'next/image'
import {
  IconCalendar,
  IconMapPin,
  IconArrowRight,
  IconLeaf,
  IconCheck,
} from '@tabler/icons-react'

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'Learn about Vanashree Gramvikas Pratishthan — a grassroots NGO from Gatewadi, Maharashtra working on afforestation, education, and community development.',
}

export default async function AboutPage() {
  const [page, metrics] = await Promise.all([
    getPageContent(),
    getImpactMetrics(),
  ])

  return (
    <>
      <PageHeader
        eyebrow="About Vanashree"
        title="Our Story"
        description={`Grassroots NGO empowering rural communities in Maharashtra — ${page.aboutEstablished}`}
      />

      {/* ─── Story ─── */}
      <section className="py-24 md:py-32 bg-white">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <FadeIn>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
                    <IconLeaf size={20} className="text-gold" />
                  </div>
                  <div>
                    <p className="text-gold text-xs font-semibold uppercase tracking-widest">Our Journey</p>
                    <p className="text-pebble text-xs flex items-center gap-1 mt-0.5">
                      <IconCalendar size={12} /> {page.aboutEstablished} &middot;
                      <IconMapPin size={12} />
                      <a
                        href="https://www.google.com/maps/place/18%C2%B056'13.9%22N+74%C2%B026'36.8%22E/@18.93718,74.443565,17z/data=!3m1!4b1!4m4!3m3!8m2!3d18.93718!4d74.443565!18m1!1e1?entry=ttu&g_ep=EgoyMDI2MDUxMy4wIKXMDSoASAFQAw%3D%3D"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-1 hover:text-forest/80 transition-colors"
                      >
                        {page.aboutLocation}
                      </a>
                    </p>
                  </div>
                </div>
              </FadeIn>
              <FadeIn delay={0.1}>
                <div className="space-y-6">
                  <p className="text-stone text-base md:text-lg leading-relaxed">
                    {page.aboutBody}
                  </p>
                  <p className="text-stone text-base md:text-lg leading-relaxed">
                    {page.aboutBodyExtended}
                  </p>
                </div>
              </FadeIn>
            </div>
            <FadeIn direction="right">
              <div className="relative">
                <div className="rounded-2xl overflow-hidden shadow-2xl shadow-forest/10">
                  <Image
                    src={galleryImages[2].src}
                    alt={galleryImages[2].alt}
                    width={galleryImages[2].width}
                    height={galleryImages[2].height}
                    className="object-cover w-full h-auto hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
                {/* Floating thumbnail */}
                <div className="absolute -bottom-6 -left-6 w-32 h-32 md:w-40 md:h-40 rounded-xl overflow-hidden border-4 border-white shadow-xl">
                  <Image
                    src={galleryImages[3].src}
                    alt={galleryImages[3].alt}
                    width={galleryImages[3].width}
                    height={galleryImages[3].height}
                    className="object-cover w-full h-full"
                    sizes="160px"
                  />
                </div>
                <div className="absolute -top-3 -right-3 w-12 h-12 border-t-2 border-r-2 border-gold/30 rounded-tr-xl" />
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="py-16 md:py-24 bg-cream">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <FadeIn>
            <div className="text-center mb-12">
              <p className="text-gold text-sm font-semibold uppercase tracking-widest mb-3">Frequently asked</p>
              <h2 className="text-3xl md:text-4xl font-bold text-forest">What people ask about our work</h2>
            </div>
          </FadeIn>
          <div className="space-y-4">
            {[
              {
                question: 'What do we do?',
                answer: [
                  'We plant trees, nurture young saplings, and water growing plantations.',
                  'We organize cleanup drives to restore village land and riverbanks.',
                  'We support healthy communities through green, sustainable action.',
                ],
              },
              {
                question: 'How do we grow community forests?',
                answer: [
                  'We partner with residents and schools to select native saplings.',
                  'We care for trees throughout the monsoon and dry season.',
                  'We teach local teams to protect, prune, and monitor every grove.',
                ],
              },
              {
                question: 'Why join Vanashree’s green movement?',
                answer: [
                  'Because our work blends afforestation, cleanup drives, and village-led care.',
                  'We focus on lasting impact: cleaner fields, stronger soils, and cooler neighborhoods.',
                  'Every action supports Maharashtra’s rural health, education, and environment.',
                ],
              },
            ].map((faq, idx) => (
              <FadeIn key={faq.question} delay={idx * 0.05}>
                <details className="group rounded-3xl border border-moss/20 bg-white p-5 shadow-sm">
                  <summary className="flex items-center justify-between gap-4 cursor-pointer text-left text-base font-semibold text-forest">
                    <span>{faq.question}</span>
                    <IconArrowRight size={20} className="text-forest transition-transform duration-300 group-open:rotate-90" />
                  </summary>
                  <div className="faq-content mt-4 space-y-2 text-stone text-sm leading-6">
                    {faq.answer.map((item) => (
                      <p key={item} className="flex items-center gap-2">
                        <span className="inline-flex h-2.5 w-2.5 rounded-full bg-forest shrink-0" />
                        <span className="font-medium text-stone">{item}</span>
                      </p>
                    ))}
                  </div>
                </details>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Impact strip ─── */}
      <ImpactStrip metrics={metrics} variant="compact" />

      {/* ─── Key Milestones ─── */}
      <section className="py-16 md:py-24 bg-cream">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <FadeIn>
            <div className="text-center mb-12">
              <p className="text-gold text-sm font-semibold uppercase tracking-widest mb-3">Journey So Far</p>
              <h2 className="text-2xl md:text-4xl font-bold text-forest">Key Milestones</h2>
            </div>
          </FadeIn>
          <div className="space-y-6">
            {[
              { icon: <IconLeaf size={18} className="text-leaf" />, text: 'Planted over 1,000+ native trees across Gatewadi and surrounding villages' },
              { icon: <IconCheck size={18} className="text-gold" />, text: 'Constructed a concrete drinking water tank at Gatewadi primary school' },
              { icon: <IconCheck size={18} className="text-gold" />, text: 'Received community land donation for environmental conservation projects' },
              { icon: <IconCheck size={18} className="text-gold" />, text: 'Conducted regular cleanup drives across 15+ villages in Parner taluka' },
              { icon: <IconCheck size={18} className="text-gold" />, text: 'Supported educational infrastructure for 200+ rural students' },
            ].map((milestone, idx) => (
              <FadeIn key={idx} delay={idx * 0.05}>
                <div className="flex items-start gap-4 bg-white rounded-xl p-5 border border-moss/10 hover:border-gold/20 transition-colors duration-300">
                  <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center shrink-0 mt-0.5">
                    {milestone.icon}
                  </div>
                  <p className="text-stone text-base leading-relaxed">{milestone.text}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <CTASection
        title="Want to be part of our journey?"
        body="We're always looking for passionate individuals to contribute their time, skills, or resources."
        primaryLabel="Get in Touch"
        primaryHref="/contact"
        secondaryLabel="View Programs"
        secondaryHref="/programs"
      />
    </>
  )
}
