'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  IconArrowLeft,
  IconBrandWhatsapp,
  IconCalendar,
  IconHeart,
  IconLoader2,
  IconMapPin,
  IconPackage,
  IconShieldCheck,
  IconTrash,
} from '@tabler/icons-react'
import {
  STATUS_LABELS,
  timeAgo,
  type ListingDTO,
} from '@/lib/donations'
import type { DonationStatus } from '@/lib/donations'
import { UserLocationMap } from '@/components/donation/UserLocationMap'

interface ListingDetailProps {
  listing: ListingDTO
  viewerUserId: string | null
}

const STATUS_OPTIONS: Array<{ value: DonationStatus; label: string }> = [
  { value: 'available', label: 'Available' },
  { value: 'reserved', label: 'Reserved' },
  { value: 'donated', label: 'Donated' },
]

export function ListingDetail({ listing, viewerUserId }: ListingDetailProps) {
  const router = useRouter()
  const [favourited, setFavourited] = useState(listing.favouritedByMe)
  const [favouriteCount, setFavouriteCount] = useState(listing.favouriteCount)
  const [busy, setBusy] = useState<'favourite' | 'status' | 'delete' | null>(null)
  const [status, setStatus] = useState<DonationStatus>(listing.status)
  const [imageUrl, setImageUrl] = useState<string | null>(listing.imageUrl)

  useEffect(() => {
    if (imageUrl) return
    if (viewerUserId !== listing.seller.id) return
    let cancelled = false
    let attempts = 0

    const timer = window.setInterval(async () => {
      attempts += 1
      if (cancelled || attempts > 20) {
        window.clearInterval(timer)
        return
      }
      try {
        const res = await fetch(`/api/donations/${listing.id}`)
        if (!res.ok) return
        const data = await res.json()
        const next = data.listing?.imageUrl as string | null | undefined
        if (typeof next === 'string' && next) {
          window.clearInterval(timer)
          if (!cancelled) setImageUrl(next)
        }
      } catch {
        // Keep polling until the upload finishes or attempts run out.
      }
    }, 2000)

    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [imageUrl, listing.id, viewerUserId, listing.seller.id])

  const isOwner = viewerUserId != null && viewerUserId === listing.seller.id
  const canContact = viewerUserId != null && !isOwner && listing.status === 'available'

  const toggleFavourite = async () => {
    if (!viewerUserId) {
      toast.info('Sign in to save favourites')
      router.push('/auth?intent=donation')
      return
    }
    if (busy) return
    setBusy('favourite')
    try {
      const res = await fetch(`/api/donations/${listing.id}/favorite`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Could not update favourite')
      setFavourited(data.favourited)
      setFavouriteCount((prev) => (data.favourited ? prev + 1 : Math.max(0, prev - 1)))
      toast.success(data.favourited ? 'Saved to favourites' : 'Removed from favourites')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not update favourite')
    } finally {
      setBusy(null)
    }
  }

  const changeStatus = async (next: DonationStatus) => {
    if (busy || next === status) return
    setBusy('status')
    try {
      const res = await fetch(`/api/donations/${listing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Could not update status')
      setStatus(next)
      toast.success(`Marked as ${STATUS_LABELS[next]}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not update status')
    } finally {
      setBusy(null)
    }
  }

  const deleteListing = async () => {
    if (!window.confirm('Delete this listing permanently? This cannot be undone.')) return
    setBusy('delete')
    try {
      const res = await fetch(`/api/donations/${listing.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Could not delete listing')
      toast.success('Listing deleted')
      router.replace('/donation/my')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not delete listing')
      setBusy(null)
    }
  }

  const whatsappHref = `https://wa.me/${listing.seller.phone?.replace(/\D/g, '') ?? ''}?text=${encodeURIComponent(
    `Hi, I'm interested in your donation "${listing.title}" listed on Vanashree Donation (${listing.location}). Is it still available?`
  )}`

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-10">
      <Link
        href="/donation"
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-leaf transition-colors hover:text-forest"
      >
        <IconArrowLeft size={15} />
        Back to marketplace
      </Link>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-8">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-[24px] border border-moss/20 bg-cream shadow-lg shadow-forest/8 md:rounded-[28px] lg:sticky lg:top-6 lg:self-start">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={listing.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-cream to-sand">
              <IconPackage size={64} className="text-moss" />
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col gap-5">
          <div className="order-1">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-3 py-1 text-[11px] font-bold ${
                  listing.status === 'donated'
                    ? 'bg-terracotta/15 text-terracotta'
                    : listing.status === 'reserved'
                      ? 'bg-amber/25 text-gold'
                      : 'bg-leaf/15 text-leaf'
                }`}
              >
                {STATUS_LABELS[listing.status]}
              </span>
              <span className="rounded-full bg-cream px-3 py-1 text-[11px] font-semibold text-pebble">
                {listing.category}
              </span>
              <span className="rounded-full bg-cream px-3 py-1 text-[11px] font-semibold text-pebble">
                {listing.condition}
              </span>
            </div>

            <h1 className="text-2xl font-bold leading-snug text-forest md:text-3xl">
              {listing.title}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-pebble">
              <span className="inline-flex items-center gap-1.5">
                <IconMapPin size={13} className="text-leaf" />
                {listing.location}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <IconCalendar size={13} className="text-gold" />
                {timeAgo(listing.createdAt)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <IconHeart size={13} className="text-terracotta" />
                {favouriteCount} favourited
              </span>
            </div>
          </div>

          <div className="rounded-[24px] border border-moss/15 bg-white/80 p-5 order-3 lg:order-2">
            <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-forest">Description</h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-stone">
              {listing.description}
            </p>
          </div>

          {/* Seller card */}
          <div className="flex items-center gap-4 rounded-[24px] border border-gold/20 bg-white/80 p-5 order-4 lg:order-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-forest text-base font-bold text-white">
              {listing.seller.fullName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-forest">{listing.seller.fullName}</p>
              <p className="mt-0.5 text-xs text-pebble">Vanashree community member</p>
            </div>
            <div className="rounded-full bg-leaf/10 p-2 text-leaf">
              <IconShieldCheck size={18} />
            </div>
          </div>

          <div className="order-5 lg:order-4">
            <UserLocationMap
              itemLocation={listing.location}
              lat={listing.lat}
              lng={listing.lng}
            />
          </div>

          {/* Actions */}
          <div className="order-2 flex flex-col gap-3 lg:order-5">
            {isOwner ? (
              <>
                <div className="grid grid-cols-3 gap-2 rounded-[24px] border border-moss/15 bg-white/80 p-2">
                  {STATUS_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => changeStatus(option.value)}
                      disabled={busy !== null}
                      className={`rounded-[16px] px-2 py-2.5 text-xs font-bold transition-all ${
                        status === option.value
                          ? 'bg-forest text-white shadow-md shadow-forest/20'
                          : 'text-pebble hover:bg-cream hover:text-forest'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={deleteListing}
                  disabled={busy !== null}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {busy === 'delete' ? (
                    <>
                      <IconLoader2 size={15} className="animate-spin" /> Deleting…
                    </>
                  ) : (
                    <>
                      <IconTrash size={15} /> Delete listing
                    </>
                  )}
                </button>
              </>
            ) : (
              <>
                {canContact ? (
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#25D366]/25 transition-all hover:scale-[1.01] hover:bg-[#1fb457]"
                  >
                    <IconBrandWhatsapp size={18} />
                    Contact on WhatsApp
                  </a>
                ) : listing.status !== 'donated' ? (
                  <Link
                    href="/auth?intent=donation"
                    className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-leaf/30 bg-white px-6 py-3.5 text-sm font-bold text-forest transition-all hover:border-leaf/60 hover:bg-cream"
                  >
                    Sign in to contact the donor
                  </Link>
                ) : (
                  <div className="rounded-[24px] border border-terracotta/20 bg-terracotta/5 px-6 py-4 text-center text-sm font-semibold text-terracotta">
                    This item has been donated — thank you for caring!
                  </div>
                )}

                {viewerUserId && listing.status !== 'donated' && (
                  <button
                    type="button"
                    onClick={toggleFavourite}
                    disabled={busy !== null}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-moss/25 bg-white/80 px-6 py-3.5 text-sm font-semibold text-forest transition-all hover:border-leaf/40 hover:bg-cream disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {busy === 'favourite' ? (
                      <IconLoader2 size={15} className="animate-spin" />
                    ) : (
                      <IconHeart
                        size={15}
                        className={favourited ? 'text-terracotta' : ''}
                        fill={favourited ? 'currentColor' : 'none'}
                      />
                    )}
                    {favourited ? 'Favourited' : 'Add to favourites'}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
