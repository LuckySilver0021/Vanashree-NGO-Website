import type { Metadata } from 'next'
import { PageHeader } from '@/components/layout/PageHeader'
import { GalleryGrid } from './GalleryGrid'
import { galleryImages } from '@/lib/gallery'
import { FadeIn } from '@/components/motion/FadeIn'
import { IconBrandInstagram, IconArrowUpRight } from '@tabler/icons-react'

export const metadata: Metadata = {
  title: 'Gallery',
  description:
    'Photo gallery from Vanashree Gramvikas Pratishthan — see our plantation drives, school projects, cleanup campaigns, and community events.',
}

const CATEGORIES = [
  { key: 'all', label: 'All Photos' },
  { key: 'plantation', label: 'Plantation' },
  { key: 'education', label: 'Education' },
  { key: 'community', label: 'Community' },
  { key: 'environment', label: 'Environment' },
  { key: 'event', label: 'Events' },
] as const

export default function GalleryPage() {
  return (
    <>
      <PageHeader
        eyebrow="Gallery"
        title="Moments from the Field"
        description="A visual journey through our tree plantations, school projects, and community events"
      />

      <section className="py-16 md:py-24 bg-cream">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <GalleryGrid images={galleryImages} categories={CATEGORIES} />

          {/* Instagram CTA */}
          <FadeIn>
            <div className="mt-16 text-center">
              <p className="text-stone text-sm mb-4">Follow us for more updates</p>
              <a
                href="https://www.instagram.com/vanashree_ngo/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-forest text-white px-6 py-3 rounded-full font-semibold text-sm hover:bg-canopy transition-colors duration-300 shadow-sm"
              >
                <IconBrandInstagram size={18} />
                @vanashree_ngo
                <IconArrowUpRight size={14} />
              </a>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  )
}
