import type { Metadata } from 'next'
import { getPageContent } from '@/lib/content'
import { PageHeader } from '@/components/layout/PageHeader'
import { FadeIn } from '@/components/motion/FadeIn'
import { ContactForm } from '@/components/contact/ContactForm'
import {
  IconMail,
  IconBrandInstagram,
  IconBrandWhatsapp,
  IconArrowUpRight,
  IconLeaf,
  IconArrowRight,
  IconUsers,
} from '@tabler/icons-react'

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    'Get in touch with Vanashree Gramvikas Pratishthan. Volunteer, partner, or learn more about our work in rural Maharashtra.',
}

export default async function ContactPage() {
  const page = await getPageContent()

  return (
    <>
      <PageHeader
        eyebrow="Contact Us"
        title="Let's Create Change Together"
        description="Reach out to volunteer, partner, or learn more about our work"
      />

      <section className="py-24 md:py-32 bg-white">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
            {/* ─── Contact Form ─── */}
            <FadeIn direction="left">
              <div>
                <p className="text-gold text-sm font-semibold uppercase tracking-widest mb-3">Get in Touch</p>
                <h2 className="text-2xl md:text-3xl font-bold text-forest leading-snug mb-3">
                  We&apos;d love to hear from you
                </h2>
                <p className="text-stone text-base leading-relaxed mb-8">
                  Whether you want to volunteer, partner with us on a project,
                  or just learn more about our work — we&apos;re here to connect.
                </p>
                <ContactForm toEmail={page.footerEmail ?? 'contact@vanashree.org'} />
              </div>
            </FadeIn>

            {/* ─── Ways to help section ─── */}
            <FadeIn direction="right">
              <div className="space-y-5">
                <div className="relative bg-gradient-to-br from-petal to-cream rounded-2xl p-7 border border-moss/15 group hover:shadow-lg transition-all duration-500">
                  <div className="absolute top-0 left-6 right-6 h-0.5 bg-gradient-to-r from-leaf to-fern rounded-b" />
                  <div className="w-12 h-12 rounded-xl bg-leaf/10 flex items-center justify-center mb-4">
                    <IconLeaf size={22} className="text-leaf" />
                  </div>
                  <h3 className="text-forest font-bold text-lg mb-2">Volunteer</h3>
                  <p className="text-stone text-sm leading-relaxed mb-4">
                    Join our plantation drives, teach at community schools, or help
                    with cleanup campaigns. Every helping hand matters.
                  </p>
                  <a
                    href={`mailto:${page.footerEmail}?subject=Volunteering Inquiry`}
                    className="text-leaf hover:text-canopy text-sm font-semibold flex items-center gap-1 transition-colors"
                  >
                    Email to Volunteer <IconArrowRight size={14} />
                  </a>
                </div>

                <div className="relative bg-gradient-to-br from-sand to-petal rounded-2xl p-7 border border-gold/15 group hover:shadow-lg transition-all duration-500">
                  <div className="absolute top-0 left-6 right-6 h-0.5 bg-gradient-to-r from-gold to-amber rounded-b" />
                  <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center mb-4">
                    <IconUsers size={22} className="text-gold" />
                  </div>
                  <h3 className="text-forest font-bold text-lg mb-2">Partner With Us</h3>
                  <p className="text-stone text-sm leading-relaxed mb-4">
                    We welcome partnerships with schools, gram panchayats, and organizations
                    working towards rural development and environmental conservation.
                  </p>
                  <a
                    href={`mailto:${page.footerEmail}?subject=Partnership Inquiry`}
                    className="text-gold hover:text-amber text-sm font-semibold flex items-center gap-1 transition-colors"
                  >
                    Discuss Partnership <IconArrowRight size={14} />
                  </a>
                </div>

                <div className="relative bg-white rounded-2xl p-7 border border-terracotta/15 group hover:shadow-lg transition-all duration-500">
                  <div className="absolute top-0 left-6 right-6 h-0.5 bg-gradient-to-r from-terracotta to-gold rounded-b" />
                  <div className="w-12 h-12 rounded-xl bg-terracotta/10 flex items-center justify-center mb-4">
                    <IconBrandInstagram size={22} className="text-terracotta" />
                  </div>
                  <h3 className="text-forest font-bold text-lg mb-2">Spread the Word</h3>
                  <p className="text-stone text-sm leading-relaxed mb-4">
                    Follow us on Instagram and share our stories. Community awareness
                    is the first step to community action.
                  </p>
                  <a
                    href={page.footerInstagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-terracotta hover:text-gold text-sm font-semibold flex items-center gap-1 transition-colors"
                  >
                    Follow @vanashree_ngo <IconArrowUpRight size={14} />
                  </a>
                </div>
              </div>
            </FadeIn>
          </div>

          {/* ─── Quick contact strip ─── */}
          <FadeIn>
            <div className="mt-16 pt-10 border-t border-moss/10">
              <p className="text-center text-xs font-semibold uppercase tracking-widest text-pebble mb-8">
                Or reach us directly
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
                {page.footerEmail && (
                  <a
                    href={`mailto:${page.footerEmail}`}
                    className="flex items-center gap-3 bg-leaf/5 hover:bg-leaf/10 border border-leaf/15 rounded-2xl px-6 py-4 transition-all duration-200 group w-full sm:w-auto"
                  >
                    <div className="w-10 h-10 rounded-xl bg-leaf/10 flex items-center justify-center shrink-0">
                      <IconMail size={20} className="text-leaf" />
                    </div>
                    <div>
                      <p className="text-xs text-pebble font-medium">Email</p>
                      <p className="text-sm text-forest font-semibold group-hover:text-leaf transition-colors">{page.footerEmail}</p>
                    </div>
                  </a>
                )}

                {page.footerWhatsapp && (
                  <a
                    href={`https://wa.me/${page.footerWhatsapp}?text=Hi%20Vanashree%20team%2C%20I%20would%20like%20to%20connect%20with%20you.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 bg-green-50 hover:bg-green-100 border border-green-100 rounded-2xl px-6 py-4 transition-all duration-200 group w-full sm:w-auto"
                  >
                    <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                      <IconBrandWhatsapp size={20} className="text-[#25D366]" />
                    </div>
                    <div>
                      <p className="text-xs text-pebble font-medium">WhatsApp</p>
                      <p className="text-sm text-forest font-semibold group-hover:text-green-600 transition-colors">{page.footerPhone}</p>
                    </div>
                  </a>
                )}

                <a
                  href={page.footerInstagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-terracotta/5 hover:bg-terracotta/10 border border-terracotta/15 rounded-2xl px-6 py-4 transition-all duration-200 group w-full sm:w-auto"
                >
                  <div className="w-10 h-10 rounded-xl bg-terracotta/10 flex items-center justify-center shrink-0">
                    <IconBrandInstagram size={20} className="text-terracotta" />
                  </div>
                  <div>
                    <p className="text-xs text-pebble font-medium">Instagram</p>
                    <p className="text-sm text-forest font-semibold group-hover:text-terracotta transition-colors flex items-center gap-1">
                      @vanashree_ngo <IconArrowUpRight size={12} />
                    </p>
                  </div>
                </a>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>


    </>
  )
}
