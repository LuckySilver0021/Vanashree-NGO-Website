'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useSearchParams } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import {
  IconArrowLeft,
  IconHeart,
  IconLogout,
  IconSearch,
  IconPackage,
  IconUser,
  IconLeaf,
} from '@tabler/icons-react'
import { clearGuestModeCookie } from '@/lib/auth'
import { getSearchQuery, seedSearchQuery, setSearchQuery, useSearchQuery } from '@/lib/donation-search'

function SearchBox() {
  const query = useSearchQuery()

  return (
    <input
      type="search"
      value={query.q}
      onChange={(e) => setSearchQuery({ ...getSearchQuery(), q: e.target.value })}
      placeholder="Search donated items, books, furniture…"
      aria-label="Search donations"
      className="w-full rounded-full border border-white/10 bg-white/95 py-2.5 pl-11 pr-4 text-sm text-bark placeholder:text-pebble shadow-sm focus:border-leaf focus:outline-none"
    />
  )
}

export function DonationHeader() {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const q = searchParams.get('q') ?? ''
  const category = searchParams.get('category') ?? ''
  const location = searchParams.get('location') ?? ''
  const sort = searchParams.get('sort') ?? ''

  // Restore a shared-link / refresh query into the search store (first mount only).
  useEffect(() => {
    seedSearchQuery({ q, category, location, sort })
  }, [q, category, location, sort])

  const handleLogout = () => {
    clearGuestModeCookie()
    signOut({ callbackUrl: '/' })
  }

  // Guests are unauthenticated visitors — their guest cookie is honoured app-wide
  // by the server (read-only). The header simply mirrors that: no session → guest.
  const isGuestView = status !== 'authenticated'
  const displayName = isGuestView ? 'Guest' : session?.user?.fullName ?? 'Member'

  return (
    <header className="sticky top-0 z-40 bg-forest/95 shadow-lg shadow-black/10 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="flex h-16 items-center justify-between gap-3">
          {/* Brand + back */}
          <div className="flex min-w-0 items-center gap-2.5">
            <Link
              href="/"
              aria-label="Back to Vanashree home"
              className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white transition-colors hover:bg-white/20 sm:flex"
            >
              <IconArrowLeft size={16} />
            </Link>
            <Link href="/donation" className="flex min-w-0 items-center gap-2.5">
              <Image
                src="/images/logo/logo.png"
                alt="Vanashree Logo"
                width={34}
                height={34}
                className="rounded-full ring-2 ring-white/10"
                priority
              />
              <span className="min-w-0">
                <span className="block truncate text-sm font-bold tracking-wide text-white">
                  Vanashree Donation
                </span>
                <span className="hidden text-[10px] font-medium tracking-[0.18em] text-gold uppercase md:block">
                  Donation Marketplace
                </span>
              </span>
            </Link>
          </div>

          {/* Search — desktop */}
          <div className="relative hidden max-w-xl flex-1 md:block">
            <IconSearch size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-pebble" />
            <SearchBox />
          </div>

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-1.5 md:gap-2">
            <Link
              href="/donation/favorites"
              className={`hidden h-9 w-9 items-center justify-center rounded-xl transition-colors sm:flex ${
                pathname === '/donation/favorites' ? 'bg-white/20 text-white' : 'bg-white/10 text-white/70 hover:bg-white/15 hover:text-white'
              }`}
              aria-label="Favourites"
            >
              <IconHeart size={16} />
            </Link>

            <Link
              href="/donation/my"
              className={`hidden h-9 items-center gap-1.5 rounded-xl px-3 text-xs font-medium transition-colors sm:flex ${
                pathname === '/donation/my' ? 'bg-white/20 text-white' : 'bg-white/10 text-white/70 hover:bg-white/15 hover:text-white'
              }`}
            >
              <IconPackage size={14} />
              <span className="hidden lg:inline">My Donations</span>
            </Link>

            <Link
              href="/donation/new"
              className="flex items-center gap-1.5 rounded-full bg-gold px-3.5 py-2 text-xs font-bold text-forest shadow-md shadow-gold/20 transition-all hover:scale-[1.02] hover:bg-amber md:px-4 md:py-2.5"
            >
              <IconPackage size={14} />
              Post Donation
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="flex h-9 items-center gap-1.5 rounded-full border border-white/20 px-3.5 text-xs font-semibold text-white/85 transition-colors hover:bg-white/10"
              aria-label="Log out"
            >
              {isGuestView ? <IconLeaf size={14} /> : <IconUser size={14} />}
              <span className="hidden max-w-24 truncate md:inline">{displayName}</span>
              <IconLogout size={13} className="hidden md:block" />
            </button>
          </div>
        </div>

        {/* Search — mobile */}
        <div className="pb-3 md:hidden">
          <div className="relative">
            <IconSearch size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-pebble" />
            <SearchBox />
          </div>
        </div>
      </div>
    </header>
  )
}
