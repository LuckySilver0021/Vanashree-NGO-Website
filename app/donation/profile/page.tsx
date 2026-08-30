import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { IconPackage, IconLeaf, IconUser } from '@tabler/icons-react'
import { DonationHeader } from '@/components/donation/DonationHeader'
import { getSessionUserId } from '@/lib/donations.server'
import { getProfileStats } from '@/lib/profile'

export const metadata: Metadata = {
  title: 'My Profile',
  description: 'Your Vanashree impact — items donated and saplings planted.',
}

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const headerList = await headers()
  const cookieHeader = headerList.get('cookie') ?? ''
  const isGuest = cookieHeader
    .split(';')
    .some((entry) => entry.trim().startsWith('vanashree-guest='))

  const userId = await getSessionUserId()

  if (isGuest || !userId) {
    redirect('/auth?intent=donation')
  }

  const stats = await getProfileStats(userId)

  if (!stats) {
    redirect('/auth?intent=donation')
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(168,197,122,0.18),transparent_34%),linear-gradient(135deg,#f8f7f0_0%,#f4f8ee_55%,#f9f4e8_100%)]">
      <DonationHeader />
      <main className="mx-auto max-w-3xl px-4 py-10 md:px-6">
        <div className="mb-8 text-center">
          <p className="text-gold text-xs font-semibold uppercase tracking-[0.24em]">
            Your impact
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-forest">My profile</h1>
        </div>

        <div className="overflow-hidden rounded-3xl border border-moss/15 bg-white shadow-lg shadow-forest/8">
          <div className="flex items-center gap-4 bg-forest px-6 py-6">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/15 text-white">
              <IconUser size={26} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-lg font-bold text-white">{stats.fullName}</p>
              <p className="text-[11px] font-medium tracking-[0.18em] text-gold uppercase">
                Vanashree member
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
            <div className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-petal px-6 py-8 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-leaf/15 text-leaf">
                <IconPackage size={22} />
              </span>
              <span className="text-4xl font-bold text-forest">{stats.donatedCount}</span>
              <span className="text-sm font-medium text-pebble">Items donated</span>
              <span className="text-xs text-pebble/80">
                Only items marked as donated
              </span>
            </div>

            <div className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-petal px-6 py-8 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-leaf/15 text-leaf">
                <IconLeaf size={22} />
              </span>
              <span className="text-4xl font-bold text-forest">{stats.saplingCount}</span>
              <span className="text-sm font-medium text-pebble">Saplings planted</span>
              <span className="text-xs text-pebble/80">All saplings you planted</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
