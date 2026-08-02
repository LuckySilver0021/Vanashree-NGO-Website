'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { IconPackage, IconPlus } from '@tabler/icons-react'
import { ListingCard } from '@/components/donation/ListingCard'
import { STATUS_LABELS, type DonationStatus, type ListingDTO } from '@/lib/donations'

interface MyListingsProps {
  initial: ListingDTO[]
  viewerUserId: string
}

type Filter = 'all' | DonationStatus

export function MyListings({ initial, viewerUserId }: MyListingsProps) {
  const [filter, setFilter] = useState<Filter>('all')
  const [listings, setListings] = useState<ListingDTO[]>(initial)

  const filtered = useMemo(
    () => (filter === 'all' ? listings : listings.filter((l) => l.status === filter)),
    [listings, filter]
  )

  const counts = useMemo(() => {
    const base = { all: listings.length, available: 0, reserved: 0, donated: 0 }
    for (const l of listings) base[l.status] += 1
    return base
  }, [listings])

  const handleRemoved = (id: string) => {
    setListings((prev) => prev.filter((l) => l.id !== id))
  }

  const tabs: Array<{ value: Filter; label: string }> = [
    { value: 'all', label: `All (${counts.all})` },
    { value: 'available', label: `Available (${counts.available})` },
    { value: 'reserved', label: `Reserved (${counts.reserved})` },
    { value: 'donated', label: `Donated (${counts.donated})` },
  ]

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setFilter(tab.value)}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-all ${
              filter === tab.value
                ? 'bg-forest text-white shadow-md shadow-forest/20'
                : 'border border-moss/25 bg-white/80 text-forest hover:border-leaf/40 hover:bg-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-10 flex flex-col items-center rounded-3xl border border-dashed border-moss/40 bg-white/60 px-6 py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cream">
            <IconPackage size={26} className="text-moss" />
          </div>
          <h3 className="mt-5 text-lg font-bold text-forest">
            {listings.length === 0 ? 'No donations posted yet' : `No ${STATUS_LABELS[filter as DonationStatus]?.toLowerCase() ?? ''} items`}
          </h3>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-pebble">
            {listings.length === 0
              ? 'Share something you no longer need with the community — it takes less than a minute.'
              : 'Nothing in this state right now.'}
          </p>
          {listings.length === 0 && (
            <Link
              href="/donation/new"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-forest px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-forest/20 transition-all hover:bg-canopy"
            >
              <IconPlus size={16} />
              Post a donation
            </Link>
          )}
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              viewerUserId={viewerUserId}
              onRemoved={handleRemoved}
            />
          ))}
        </div>
      )}
    </div>
  )
}
