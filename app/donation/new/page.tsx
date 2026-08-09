import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getSessionUserId } from '@/lib/donations.server'
import { DonationHeader } from '@/components/donation/DonationHeader'
import { PostListingForm } from '@/components/donation/PostListingForm'

export const metadata: Metadata = {
  title: 'Post a Donation',
  description:
    'List a pre-loved item for the Vanashree Daan community — books, furniture, clothes and more.',
}

export const dynamic = 'force-dynamic'

export default async function PostDonationPage() {
  const headerList = await headers()
  const cookieHeader = headerList.get('cookie') ?? ''
  const isGuest = cookieHeader
    .split(';')
    .some((entry) => entry.trim().startsWith('vanashree-guest='))

  const userId = await getSessionUserId()

  if (isGuest || !userId) {
    redirect('/auth?intent=donation')
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(168,197,122,0.18),transparent_34%),linear-gradient(135deg,#f8f7f0_0%,#f4f8ee_55%,#f9f4e8_100%)]">
      <DonationHeader />
      <main className="mx-auto max-w-3xl px-4 py-10 md:px-6">
        <div className="mb-8 text-center">
          <p className="text-gold text-xs font-semibold uppercase tracking-[0.24em]">
            Give it a second life
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-forest">Post a donation</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-pebble">
            Something you no longer need could be exactly what a neighbour is searching for. List
            it here — it&apos;s free.
          </p>
        </div>
        <PostListingForm />
      </main>
    </div>
  )
}
