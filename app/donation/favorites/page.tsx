import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { DonationHeader } from '@/components/donation/DonationHeader'
import { FavouritesGrid } from '@/components/donation/FavouritesGrid'
import { getSessionUserId, queryListings } from '@/lib/donations.server'

export const metadata: Metadata = {
  title: 'Favourites',
  description: 'Items you have saved on Vanashree Daan.',
}

export const dynamic = 'force-dynamic'

export default async function FavouritesPage() {
  const headerList = await headers()
  const cookieHeader = headerList.get('cookie') ?? ''
  const isGuest = cookieHeader
    .split(';')
    .some((entry) => entry.trim().startsWith('vanashree-guest='))

  const userId = await getSessionUserId()

  if (isGuest || !userId) {
    redirect('/auth?intent=donation')
  }

  const result = await queryListings({
    favorites: true,
    statuses: ['available', 'reserved'],
    take: 24,
    userId,
  })

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(168,197,122,0.18),transparent_34%),linear-gradient(135deg,#f8f7f0_0%,#f4f8ee_55%,#f9f4e8_100%)]">
      <DonationHeader />
      <main className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <div className="mb-8 text-center">
          <p className="text-gold text-xs font-semibold uppercase tracking-[0.24em]">
            Saved for later
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-forest">Your favourites</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-pebble">
            Items you&apos;ve hearted across the marketplace. Remove a heart to clear it from this
            list.
          </p>
        </div>
        <FavouritesGrid initial={result.listings} viewerUserId={userId} />
      </main>
    </div>
  )
}
