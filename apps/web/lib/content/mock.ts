/**
 * Mock content data layer for Vanashree NGO website.
 *
 * This file mirrors the exact shape of future Sanity GROQ responses.
 * When Sanity is set up (Phase 5), replace the import:
 *   from '@/lib/content/mock' → from '@/lib/content/sanity'
 * and everything just works.
 */

// ─── Types ──────────────────────────────────────────────

export interface Program {
  _id: string
  title: string
  slug: string
  shortDescription: string
  fullDescription: string
  icon: string
  order: number
  highlights?: string[]
}

export interface ImpactMetric {
  _id: string
  value: number
  suffix: string
  label: string
  sublabel?: string
  icon: string
  order: number
}

export interface Post {
  _id: string
  title: string
  slug: string
  excerpt: string
  body: string
  coverImage: string
  publishedAt: string
  category: string
}

export interface TeamMember {
  _id: string
  name: string
  role: string
  bio: string
  photo: string
  order: number
}

export interface PageContent {
  // Hero
  heroTagline: string
  heroSubtitle: string
  heroCta1: string
  heroCta2: string
  heroBadge: string
  // About
  aboutTitle: string
  aboutBody: string
  aboutBodyExtended: string
  aboutEstablished: string
  aboutLocation: string
  aboutServiceYears: string
  // Mission / Vision
  missionStatement: string
  visionStatement: string
  // CTA
  ctaTitle: string
  ctaBody: string
  ctaButtonText: string
  // Footer
  footerTagline: string
  footerAddress: string
  footerRegistration: string
  footerEmail: string
  footerPhone: string
  footerWhatsapp: string
  footerInstagram: string
  // Donate
  donateTrustName: string
  donateUpiId: string
  donateBankName: string
  donateBankBranch: string
  donateBankAccount: string
  donateIfsc: string
}

// ─── Mock Data ──────────────────────────────────────────

export const programs: Program[] = [
  {
    _id: 'prog-1',
    title: 'Afforestation',
    slug: 'afforestation',
    shortDescription:
      'Planting native trees and restoring green cover across rural Maharashtra. 1,000+ trees planted and distributed in Gatewadi and surrounding villages.',
    fullDescription:
      'Our flagship afforestation programme focuses on planting and distributing native saplings across Gatewadi, Parner taluka, and surrounding villages. In collaboration with local farmers, schools, and gram panchayats, we have planted over 1,000 trees — including neem, banyan, mango, and tamarind. Each monsoon, we run large-scale plantation drives that bring together community volunteers of all ages. We also maintain tree nurseries and offer guidance on organic farming to promote long-term environmental sustainability.',
    icon: 'tree',
    order: 1,
    highlights: [
      '1,000+ native trees planted',
      'Monsoon plantation drives every year',
      'Species: Neem, Banyan, Mango, Tamarind',
      'Community volunteer participation',
    ],
  },
  {
    _id: 'prog-2',
    title: 'Education & Infrastructure',
    slug: 'education',
    shortDescription:
      'Building school infrastructure, providing learning resources, constructing water tanks, and ensuring access to quality education for rural children.',
    fullDescription:
      'We believe every child deserves access to quality education. Our Education & Infrastructure programme focuses on building school facilities — from constructing classrooms and drinking water tanks to donating desks, books, and stationery. We have built a concrete drinking water tank at the Gatewadi school, providing clean water to students daily. We run after-school tutoring centres, science workshops, and digital literacy camps. Our volunteers also mentor first-generation learners and support families in understanding the value of continued education.',
    icon: 'book',
    order: 2,
    highlights: [
      'School infrastructure development',
      'Drinking water tank at Gatewadi school',
      'Learning resources & stationery',
      'After-school tutoring centres',
    ],
  },
  {
    _id: 'prog-3',
    title: 'Environmental Action',
    slug: 'environmental-action',
    shortDescription:
      'Leading systematic environmental cleanup drives, waste management awareness, and community hygiene campaigns across rural villages.',
    fullDescription:
      'Our Environmental Action programme leads systematic cleanup drives across villages in Parner taluka. Volunteers collect waste from public spaces, rivers, and roadsides during regular campaigns. We conduct awareness sessions on waste segregation, composting, and hygiene. We partner with the zilla parishad for proper waste disposal. Land has been donated by community members for environmental projects, reinforcing our commitment to keeping rural Maharashtra clean, green, and healthy for future generations.',
    icon: 'recycle',
    order: 3,
    highlights: [
      'Village cleanup drives',
      'Waste segregation training',
      'Community land donation received',
      'Partnership with zilla parishad',
    ],
  },
]

export const impactMetrics: ImpactMetric[] = [
  {
    _id: 'impact-1',
    value: 1000,
    suffix: '+',
    label: 'Trees Planted',
    sublabel: 'across Gatewadi & surrounding villages',
    icon: 'tree',
    order: 1,
  },
  {
    _id: 'impact-2',
    value: 15,
    suffix: '+',
    label: 'Villages Reached',
    sublabel: 'in Parner taluka',
    icon: 'map-pin',
    order: 2,
  },
  {
    _id: 'impact-3',
    value: 500,
    suffix: '+',
    label: 'Lives Impacted',
    sublabel: 'direct beneficiaries',
    icon: 'heart',
    order: 3,
  },
  {
    _id: 'impact-4',
    value: 200,
    suffix: '+',
    label: 'Students Supported',
    sublabel: 'access to quality education',
    icon: 'school',
    order: 4,
  },
]

export const posts: Post[] = [
  {
    _id: 'post-1',
    title: 'Monsoon Plantation Drive: 200 Saplings in Gatewadi',
    slug: 'monsoon-plantation-drive-gatewadi',
    excerpt:
      'Our monsoon plantation drive saw 200 native saplings planted across Gatewadi village with enthusiastic community participation from all age groups.',
    body: `Every monsoon brings new life to Gatewadi. This year's plantation drive saw 200 native saplings — neem, banyan, mango, and tamarind — planted across the village with enthusiastic community participation.

Volunteers from all age groups came together to green the village roads, school compound, and community spaces. Children from the local school planted their "own" trees, learning about environmental stewardship firsthand.

The drive was supported by the local gram panchayat, who committed to maintaining the saplings through the monsoon season, including regular watering and protection from cattle grazing.

This event is part of our larger vision to transform barren landscapes into thriving green corridors. With over 1,000 trees already planted, we are well on our way to creating a greener future for Gatewadi and the surrounding villages.`,
    coverImage: '/images/gallery/gallery-01.webp',
    publishedAt: '2025-08-15',
    category: 'Plantation',
  },
  {
    _id: 'post-2',
    title: 'Drinking Water Tank Inaugurated at Gatewadi School',
    slug: 'water-tank-gatewadi-school',
    excerpt:
      'A new concrete drinking water tank at Gatewadi school is now operational, providing clean and safe water to students every day.',
    body: `Access to clean drinking water is a fundamental right that every child deserves. We are proud to announce the completion of a concrete drinking water tank at the Gatewadi primary school.

The tank provides clean and safe drinking water to students daily, eliminating the need for children to carry water from home or rely on uncertain sources.

This project was made possible through community donations and volunteer labour. Local masons and villagers contributed their time and skills, making it a truly community-driven infrastructure project.

The inauguration ceremony was attended by the sarpanch, school headmaster, parents, and students. The children were visibly excited about having clean water available right in their school premises.`,
    coverImage: '/images/gallery/gallery-05.webp',
    publishedAt: '2025-06-20',
    category: 'Infrastructure',
  },
  {
    _id: 'post-3',
    title: 'Environmental Cleanup Drive Across Parner Taluka',
    slug: 'cleanup-drive-parner-taluka',
    excerpt:
      'Over 100 volunteers from multiple villages joined our environmental cleanup drive, collecting waste from public spaces, roads, and riverbanks.',
    body: `Our environmental cleanup drive brought together over 100 volunteers from villages across Parner taluka in a powerful display of community commitment to cleanliness.

Together, we collected waste from public spaces, rivers, and roadsides. The drive included hands-on awareness sessions on waste segregation and composting — practical knowledge that volunteers can apply in their own homes.

We partnered with the zilla parishad to arrange proper waste disposal and recycling. School students participated with special enthusiasm, creating handmade posters about keeping their village clean.

This initiative reinforces our commitment to environmental stewardship. A clean village is not just about aesthetics — it's about health, dignity, and the quality of life for every resident.`,
    coverImage: '/images/gallery/gallery-09.webp',
    publishedAt: '2025-04-10',
    category: 'Environment',
  },
]

export const teamMembers: TeamMember[] = [
  {
    _id: 'team-1',
    name: 'Vanashree Team',
    role: 'Founders & Volunteers',
    bio: 'A dedicated group of community leaders, volunteers, and environmental advocates working together since 2010 to transform rural Maharashtra through grassroots action.',
    photo: '/images/gallery/gallery-10.webp',
    order: 1,
  },
]

export const pageContent: PageContent = {
  heroTagline: 'Rooted in Nature.\nGrowing with Community.',
  heroSubtitle:
    'Vanashree Gramvikas Pratishthan empowers rural communities in Maharashtra through afforestation, education, and sustainable development.',
  heroCta1: 'Explore Our Work',
  heroCta2: 'Get Involved',
  heroBadge: 'Grassroots NGO · Gatewadi, Maharashtra',
  aboutTitle: 'Our Story',
  aboutBody:
    'Vanashree Gramvikas Pratishthan is a grassroots non-profit organisation rooted in Gatewadi, Parner taluka, Ahilyanagar district, Maharashtra. Dedicated to transforming rural communities through sustainable development, we work directly with villagers to address challenges in environmental conservation, education infrastructure, and community wellbeing.',
  aboutBodyExtended:
    'What began as a small group of concerned citizens planting saplings on barren hillsides has grown into a movement. Today, with over 1,000 trees planted, a school water tank constructed, and regular cleanup drives across the taluka, Vanashree touches lives through three core programmes — afforestation, education & infrastructure, and environmental action — each designed to create lasting, measurable impact in the communities we serve.',
  aboutEstablished: 'Est. 2010',
  aboutLocation: 'Gatewadi, Parner, Maharashtra',
  aboutServiceYears: '15+',
  missionStatement:
    'To empower rural communities with the resources, knowledge, and opportunities they need to build sustainable and prosperous futures — one tree, one child, one village at a time.',
  visionStatement:
    'A self-reliant rural Maharashtra where every village is green, every child is educated, and every community thrives in harmony with nature.',
  ctaTitle: 'Be Part of the Change',
  ctaBody:
    'Whether you plant a tree, teach a child, or share our story — every act of kindness grows into something lasting.',
  ctaButtonText: 'Volunteer With Us',
  footerTagline:
    'Grassroots NGO empowering rural communities through afforestation, education, and sustainable development since 2010.',
  footerAddress: 'Gatewadi, Parner, Ahilyanagar, Maharashtra, India',
  footerRegistration: 'Registered Trust · Gatewadi, Maharashtra',
  footerEmail: 'contact@vanashree.org',
  footerPhone: '+91 96996 11329',
  footerWhatsapp: '919699611329',
  footerInstagram: 'https://www.instagram.com/vanashree_ngo/',
  donateTrustName: 'Vanashree Gramvikas Pratishthan',
  donateUpiId: 'vanash969961988@barodampay',
  donateBankName: 'Bank of Baroda',
  donateBankBranch: 'Parner',
  donateBankAccount: '42090100002988',
  donateIfsc: 'BARB0PARAHM',
}

// ─── Content Fetching Functions ─────────────────────────
// Same signatures as future Sanity queries

export async function getPrograms(): Promise<Program[]> {
  return programs.sort((a, b) => a.order - b.order)
}

export async function getImpactMetrics(): Promise<ImpactMetric[]> {
  return impactMetrics.sort((a, b) => a.order - b.order)
}

export async function getLatestPosts(limit = 3): Promise<Post[]> {
  return posts
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, limit)
}

export async function getAllPosts(): Promise<Post[]> {
  return posts.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  )
}

export async function getPostBySlug(slug: string): Promise<Post | undefined> {
  return posts.find((p) => p.slug === slug)
}

export async function getTeamMembers(): Promise<TeamMember[]> {
  return teamMembers.sort((a, b) => a.order - b.order)
}

export async function getPageContent(): Promise<PageContent> {
  return pageContent
}

export async function getProgramBySlug(slug: string): Promise<Program | undefined> {
  return programs.find((p) => p.slug === slug)
}
