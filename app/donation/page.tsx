import type { Metadata } from 'next'
import { DonationHeader } from '@/components/donation/DonationHeader'
import { Marketplace } from '@/components/donation/Marketplace'
import { getSessionUserId, queryListings } from '@/lib/donations.server'
import { DONATION_CATEGORIES, DONATION_LOCATIONS, type QueryListingsResult } from '@/lib/donations'

export const metadata: Metadata = {
  title: 'Donation Marketplace',
  description:
    'Give pre-loved items a second life. Browse donations — books, furniture, electronics and more — across Maharashtra.',
}

export const dynamic = 'force-dynamic'

const SORTS = ['newest', 'oldest', 'price_asc', 'price_desc', 'popular'] as const
type SortKey = (typeof SORTS)[number]

interface PageProps {
  searchParams: Promise<{
    q?: string
    category?: string
    location?: string
    sort?: string
  }>
}

export default async function DonationMarketplacePage({ searchParams }: PageProps) {
  const params = await searchParams
  const userId = await getSessionUserId()

  const q = (params.q ?? '').trim().slice(0, 100)
  const category = (params.category ?? '').trim().slice(0, 60)
  const location = (params.location ?? '').trim().slice(0, 60)
  const sort: SortKey = SORTS.includes(params.sort as SortKey) ? (params.sort as SortKey) : 'newest'

  const initial: QueryListingsResult = await queryListings({
    q,
    category,
    location,
    sort,
    page: 1,
    take: 12,
    statuses: ['available', 'reserved'],
    userId,
  })

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(168,197,122,0.18),transparent_34%),linear-gradient(135deg,#f8f7f0_0%,#f4f8ee_55%,#f9f4e8_100%)]">
      <DonationHeader />

      <section className="relative overflow-hidden">
        <div className="absolute -left-16 -top-16 h-64 w-64 rounded-full bg-leaf/15 blur-3xl" />
        <div className="absolute -bottom-20 -right-10 h-72 w-72 rounded-full bg-gold/15 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(28,59,15,0.04),transparent_24%,rgba(200,160,81,0.06))]" />

        <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-12 text-center md:px-6 md:pb-14 md:pt-16">
          <p className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/15 px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.18em] text-forest uppercase">
            Vanashree Ecosystem
          </p>
          <h1 className="mx-auto max-w-3xl text-3xl font-bold tracking-tight text-forest md:text-5xl md:leading-[1.15]">
            Give what you no longer need.
            <span className="text-gold"> Grow what truly matters.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-pebble md:text-base">
            A free marketplace for the community. List pre-loved books, furniture, clothes and
            tools — someone nearby is waiting for exactly what you have.
          </p>
        </div>
      </section>

      <Marketplace
        initial={initial}
        viewerUserId={userId}
        categories={[...DONATION_CATEGORIES]}
        locations={[...DONATION_LOCATIONS]}
      />
    </div>
  )
}
