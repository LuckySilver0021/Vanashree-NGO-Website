/** Gallery image metadata — maps converted WebP files to display info */

export interface GalleryImage {
  src: string
  alt: string
  width: number
  height: number
  category: 'plantation' | 'education' | 'community' | 'environment' | 'event'
  featured?: boolean
}

/**
 * All 23 curated gallery images.
 * Dimensions are post-conversion (max 1200px).
 * Categories are best-guess based on the NGO's work areas.
 */
export const galleryImages: GalleryImage[] = [
  {
    src: '/images/gallery/gallery-01.webp',
    alt: 'Vanashree plantation drive - community tree planting event',
    width: 1200,
    height: 751,
    category: 'plantation',
    featured: true,
  },
  {
    src: '/images/gallery/gallery-02.webp',
    alt: 'Vanashree volunteers gathering for environmental initiative',
    width: 1200,
    height: 1200,
    category: 'community',
  },
  {
    src: '/images/gallery/gallery-03.webp',
    alt: 'Tree sapling nursery at Gatewadi village',
    width: 1200,
    height: 1200,
    category: 'plantation',
  },
  {
    src: '/images/gallery/gallery-04.webp',
    alt: 'Community members participating in afforestation programme',
    width: 1200,
    height: 1200,
    category: 'plantation',
  },
  {
    src: '/images/gallery/gallery-05.webp',
    alt: 'Vanashree awareness campaign in rural Maharashtra',
    width: 1200,
    height: 1200,
    category: 'community',
  },
  {
    src: '/images/gallery/gallery-06.webp',
    alt: 'Environmental cleanup drive by Vanashree volunteers',
    width: 1200,
    height: 1200,
    category: 'environment',
  },
  {
    src: '/images/gallery/gallery-07.webp',
    alt: 'Tree plantation ceremony at Parner taluka',
    width: 1200,
    height: 1200,
    category: 'plantation',
  },
  {
    src: '/images/gallery/gallery-08.webp',
    alt: 'Vanashree education initiative with school students',
    width: 1080,
    height: 1350,
    category: 'education',
  },
  {
    src: '/images/gallery/gallery-09.webp',
    alt: 'Community event organised by Vanashree Gramvikas Pratishthan',
    width: 1200,
    height: 1200,
    category: 'event',
  },
  {
    src: '/images/gallery/gallery-10.webp',
    alt: 'Vanashree team member with planted saplings',
    width: 1080,
    height: 1350,
    category: 'plantation',
  },
  {
    src: '/images/gallery/gallery-11.webp',
    alt: 'School infrastructure support by Vanashree NGO',
    width: 1080,
    height: 1350,
    category: 'education',
  },
  {
    src: '/images/gallery/gallery-12.webp',
    alt: 'Celebration of successful plantation drive milestone',
    width: 1200,
    height: 1200,
    category: 'event',
  },
  {
    src: '/images/gallery/gallery-13.webp',
    alt: 'Water conservation awareness at Gatewadi',
    width: 1200,
    height: 1200,
    category: 'environment',
  },
  {
    src: '/images/gallery/gallery-14.webp',
    alt: 'Vanashree community meeting and planning session',
    width: 1200,
    height: 1200,
    category: 'community',
  },
  {
    src: '/images/gallery/gallery-15.webp',
    alt: 'Afforestation results - thriving trees planted by Vanashree',
    width: 1200,
    height: 1200,
    category: 'plantation',
    featured: true,
  },
  {
    src: '/images/gallery/gallery-16.webp',
    alt: 'Large-scale tree plantation event with community participation',
    width: 1200,
    height: 1200,
    category: 'plantation',
    featured: true,
  },
  {
    src: '/images/gallery/gallery-17.webp',
    alt: 'Vanashree volunteers during environmental conservation activity',
    width: 1200,
    height: 1200,
    category: 'environment',
  },
  {
    src: '/images/gallery/gallery-18.webp',
    alt: 'Education programme session for rural students',
    width: 1200,
    height: 1200,
    category: 'education',
  },
  {
    src: '/images/gallery/gallery-19.webp',
    alt: 'Vanashree team celebrating programme milestone',
    width: 1200,
    height: 1200,
    category: 'event',
  },
  {
    src: '/images/gallery/gallery-20.webp',
    alt: 'Community development project in Parner region',
    width: 1200,
    height: 1200,
    category: 'community',
  },
  {
    src: '/images/gallery/gallery-21.webp',
    alt: 'Environmental awareness campaign banner and activities',
    width: 1200,
    height: 1200,
    category: 'environment',
  },
  {
    src: '/images/gallery/gallery-22.webp',
    alt: 'Vanashree event with local community leaders',
    width: 1200,
    height: 1200,
    category: 'event',
  },
  {
    src: '/images/gallery/gallery-23.webp',
    alt: 'Vanashree Gramvikas Pratishthan group photo with volunteers',
    width: 1200,
    height: 1200,
    category: 'community',
    featured: true,
  },
]

/** Hero image for homepage */
export const heroImage = {
  src: '/images/hero/hero-main.webp',
  alt: 'Vanashree tree plantation drive in Gatewadi, Maharashtra',
  width: 1920,
  height: 1201,
}

/** Get images by category */
export function getImagesByCategory(category: GalleryImage['category']) {
  return galleryImages.filter((img) => img.category === category)
}

/** Get featured images */
export function getFeaturedImages() {
  return galleryImages.filter((img) => img.featured)
}

/** Get unique categories with counts */
export function getCategoryCounts() {
  const counts: Record<string, number> = {}
  for (const img of galleryImages) {
    counts[img.category] = (counts[img.category] || 0) + 1
  }
  return counts
}
