'use client'

import { useState } from 'react'
import Link from 'next/link'
import { IconHeart, IconPackage } from '@tabler/icons-react'
import { ListingCard } from '@/components/donation/ListingCard'
import type { ListingDTO } from '@/lib/donations'

interface FavouritesGridProps {
  initial: ListingDTO[]
  viewerUserId: string
}

export function FavouritesGrid({ initial, viewerUserId }: FavouritesGridProps) {
  const [listings, setListings] = useState<ListingDTO[]>(initial)

  const handleRemoved = (id: string) => {
    setListings((prev) => prev.filter((l) => l.id !== id))
  }

  if (listings.length === 0) {
    return (
      <div className="mt-10 flex flex-col items-center rounded-3xl border border-dashed border-moss/40 bg-white/60 px-6 py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cream">
          <IconHeart size={26} className="text-moss" />
        </div>
        <h3 className="mt-5 text-lg font-bold text-forest">No favourites yet</h3>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-pebble">
          Tap the heart on any listing to save it here, so you can find it easily later.
        </p>
        <Link
          href="/donation"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-forest px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-forest/20 transition-all hover:bg-canopy"
        >
          <IconPackage size={16} />
          Browse the marketplace
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {listings.map((listing) => (
        <ListingCard
          key={listing.id}
          listing={listing}
          viewerUserId={viewerUserId}
          onRemoved={handleRemoved}
        />
      ))}
    </div>
  )
}
