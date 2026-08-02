'use client'

import { memo, useState, type MouseEvent } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  IconHeart,
  IconMapPin,
  IconClock,
  IconPackage,
} from '@tabler/icons-react'
import { STATUS_LABELS, formatPrice, timeAgo, type ListingDTO } from '@/lib/donations'

interface ListingCardProps {
  listing: ListingDTO
  viewerUserId?: string | null
  onRemoved?: (id: string) => void
}

const STATUS_STYLES: Record<string, string> = {
  reserved: 'bg-amber-500/90 text-white',
  donated: 'bg-terracotta/90 text-white',
}

function ListingCardInner({ listing, viewerUserId, onRemoved }: ListingCardProps) {
  const router = useRouter()
  const [favourited, setFavourited] = useState(listing.favouritedByMe)
  const [toggling, setToggling] = useState(false)

  const isOwner = viewerUserId != null && listing.seller.id === viewerUserId
  const isAvailable = listing.status === 'available'

  const handleFavourite = async (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!viewerUserId) {
      toast.info('Sign in to save favourites')
      router.push('/auth?intent=donation')
      return
    }

    if (toggling) return

    setToggling(true)
    try {
      const res = await fetch(`/api/donations/${listing.id}/favorite`, { method: 'POST' })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Could not update favourite')
        return
      }

      setFavourited(data.favourited)
      if (!data.favourited) onRemoved?.(listing.id)
      toast.success(data.favourited ? 'Saved to favourites' : 'Removed from favourites')
    } catch {
      toast.error('Could not update favourite. Please try again.')
    } finally {
      setToggling(false)
    }
  }

  return (
    <Link
      href={`/donation/${listing.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-moss/15 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-leaf/30 hover:shadow-xl hover:shadow-forest/8"
    >
      <div className="relative aspect-4/3 overflow-hidden bg-cream">
        {listing.imageUrl ? (
          <Image
            src={listing.imageUrl}
            alt={listing.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-cream to-sand">
            <IconPackage size={40} className="text-moss" />
          </div>
        )}

        {!isAvailable && (
          <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-[11px] font-bold tracking-wide shadow-sm ${STATUS_STYLES[listing.status] ?? 'bg-stone/80 text-white'}`}>
            {STATUS_LABELS[listing.status]}
          </span>
        )}

        {!isOwner && isAvailable && (
          <button
            type="button"
            onClick={handleFavourite}
            aria-label={favourited ? 'Remove from favourites' : 'Add to favourites'}
            className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md transition-all duration-200 ${
              favourited
                ? 'bg-terracotta text-white shadow-lg shadow-terracotta/30'
                : 'bg-white/85 text-stone hover:bg-white hover:text-terracotta'
            }`}
          >
            <IconHeart size={16} fill={favourited ? 'currentColor' : 'none'} />
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-lg font-bold text-forest">{formatPrice(listing.price)}</p>
          <span className="rounded-full bg-cream px-2.5 py-0.5 text-[10px] font-semibold text-leaf">
            {listing.condition}
          </span>
        </div>

        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-bark transition-colors group-hover:text-forest">
          {listing.title}
        </h3>

        <p className="line-clamp-2 text-xs leading-relaxed text-pebble">{listing.description}</p>

        <div className="mt-auto flex items-center justify-between gap-2 pt-2 text-[11px] text-pebble">
          <span className="flex items-center gap-1">
            <IconMapPin size={12} className="text-leaf" />
            {listing.location}
          </span>
          <span className="flex items-center gap-1">
            <IconClock size={12} className="text-gold" />
            {timeAgo(listing.createdAt)}
          </span>
        </div>
      </div>
    </Link>
  )
}

export const ListingCard = memo(ListingCardInner)
