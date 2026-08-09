import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { DonationHeader } from '@/components/donation/DonationHeader'
import { MyListings } from '@/components/donation/MyListings'
import { getSessionUserId, queryListings } from '@/lib/donations.server'
import { DONATION_STATUSES } from '@/lib/donations'

export const metadata: Metadata = {
  title: 'My Donations',
  description: 'Manage the items you have posted on Vanashree Daan.',
}

export const dynamic = 'force-dynamic'

export default async function MyDonationsPage() {
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
    mine: true,
    sellerId: userId,
    statuses: [...DONATION_STATUSES],
    take: 24,
    userId,
  })

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(168,197,122,0.18),transparent_34%),linear-gradient(135deg,#f8f7f0_0%,#f4f8ee_55%,#f9f4e8_100%)]">
      <DonationHeader />
      <main className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <div className="mb-8 text-center">
          <p className="text-gold text-xs font-semibold uppercase tracking-[0.24em]">
            Your listings
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-forest">My donations</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-pebble">
            Track who&apos;s interested, mark items as reserved or donated, and keep your listings
            tidy.
          </p>
        </div>
        <MyListings initial={result.listings} viewerUserId={userId} />
      </main>
    </div>
  )
}
