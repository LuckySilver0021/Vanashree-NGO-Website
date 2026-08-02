'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  IconChevronDown,
  IconPackage,
  IconPlus,
  IconSearch,
} from '@tabler/icons-react'
import { ListingCard } from '@/components/donation/ListingCard'
import {
  isSearchQueryPristine,
  seedSearchQuery,
  setSearchQuery,
  useSearchQuery,
} from '@/lib/donation-search'
import type { ListingDTO, QueryListingsResult } from '@/lib/donations'

const SORTS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'popular', label: 'Most favourited' },
] as const

type SortKey = (typeof SORTS)[number]['value']

const VALID_SORTS = new Set<string>(SORTS.map((s) => s.value))

/** Cards rendered initially / added per "Show more" click. */
const PAGE_SIZE = 24

interface MarketplaceProps {
  initial: QueryListingsResult
  viewerUserId: string | null
  categories: string[]
  locations: string[]
}

function buildQueryString(query: { q: string; category: string; location: string; sort: string }) {
  const params = new URLSearchParams()
  if (query.q.trim()) params.set('q', query.q.trim())
  if (query.category) params.set('category', query.category)
  if (query.location) params.set('location', query.location)
  if (VALID_SORTS.has(query.sort) && query.sort !== 'newest') params.set('sort', query.sort)
  const queryString = params.toString()
  return queryString ? `?${queryString}` : ''
}

function sortListings(listings: ListingDTO[], sort: string): ListingDTO[] {
  const list = [...listings]
  switch (sort) {
    case 'oldest':
      return list.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    case 'price_asc':
      return list.sort((a, b) => a.price - b.price || b.createdAt.localeCompare(a.createdAt))
    case 'price_desc':
      return list.sort((a, b) => b.price - a.price || b.createdAt.localeCompare(a.createdAt))
    case 'popular':
      return list.sort(
        (a, b) => b.favouriteCount - a.favouriteCount || b.createdAt.localeCompare(a.createdAt),
      )
    default:
      return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }
}

/** Lowercased, whitespace-normalised haystack for fast multi-token matching. */
function buildSearchIndex(listings: ListingDTO[]) {
  const index = new Map<string, string>()
  for (const listing of listings) {
    index.set(
      listing.id,
      `${listing.title} ${listing.description} ${listing.category} ${listing.location}`
        .toLowerCase()
        .replace(/\s+/g, ' '),
    )
  }
  return index
}

export function Marketplace({ initial, viewerUserId, categories, locations }: MarketplaceProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const query = useSearchQuery()
  const [catalog, setCatalog] = useState<ListingDTO[] | null>(null)
  const [visibleLimit, setVisibleLimit] = useState(PAGE_SIZE)

  const urlQ = searchParams.get('q') ?? ''
  const urlCategory = searchParams.get('category') ?? ''
  const urlLocation = searchParams.get('location') ?? ''
  const urlSort = VALID_SORTS.has(searchParams.get('sort') ?? '') ? (searchParams.get('sort') as SortKey) : 'newest'
  const urlKey = `${urlQ}|${urlCategory}|${urlLocation}|${urlSort}`
  const localKey = `${query.q}|${query.category}|${query.location}|${query.sort}`

  // Before the store is seeded (server + first client paint), the URL is the
  // query of record so the server-rendered grid, counts and labels match the
  // shared-link query exactly. Once seeded, the store takes over.
  const effective = isSearchQueryPristine()
    ? { q: urlQ, category: urlCategory, location: urlLocation, sort: urlSort }
    : query

  // Seed the shared store from the URL once (first mount).
  useEffect(() => {
    seedSearchQuery({ q: urlQ, category: urlCategory, location: urlLocation, sort: urlSort })
  }, [urlKey])

  // External URL changes (back/forward, fresh navigation) re-seed the store.
  useEffect(() => {
    if (urlKey === localKey) return
    setSearchQuery({ q: urlQ, category: urlCategory, location: urlLocation, sort: urlSort })
  }, [urlKey, localKey, urlQ, urlCategory, urlLocation, urlSort])

  // Debounced URL mirror — keeps links shareable without blocking typing.
  useEffect(() => {
    if (localKey === urlKey) return
    const timer = window.setTimeout(() => {
      router.replace(`/donation${buildQueryString(query)}`, { scroll: false })
    }, 250)
    return () => window.clearTimeout(timer)
  }, [localKey, urlKey, query, router])

  // Reset the display cap whenever the query changes.
  useEffect(() => {
    setVisibleLimit(PAGE_SIZE)
  }, [localKey])

  // Prefetch the full catalog once, then all filtering happens client-side.
  useEffect(() => {
    let cancelled = false
    fetch('/api/donations?all=1', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('Catalog request failed'))))
      .then((data) => {
        if (!cancelled && Array.isArray(data.listings)) setCatalog(data.listings)
      })
      .catch((err) => {
        console.error('Catalog fetch failed — falling back to server data', err)
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Serve the server-rendered page until the catalog arrives, then switch.
  const dataset = useMemo(() => catalog ?? initial.listings, [catalog, initial.listings])
  const searchIndex = useMemo(() => buildSearchIndex(dataset), [dataset])

  const visible = useMemo(() => {
    const tokens = effective.q.trim().toLowerCase().split(/\s+/).filter(Boolean)
    const filtered = dataset.filter((listing) => {
      if (effective.category && listing.category !== effective.category) return false
      if (effective.location && listing.location !== effective.location) return false
      if (tokens.length > 0) {
        const haystack = searchIndex.get(listing.id) ?? ''
        if (!tokens.every((token) => haystack.includes(token))) return false
      }
      return true
    })
    return sortListings(filtered, effective.sort)
  }, [dataset, searchIndex, effective.q, effective.category, effective.location, effective.sort])

  const shown = visible.slice(0, visibleLimit)
  const hasMoreToShow = visibleLimit < visible.length
  const effectiveKey = `${effective.q}|${effective.category}|${effective.location}|${effective.sort}`

  // Until the full catalog arrives, the server-rendered page is the count of
  // record (it was filtered server-side by the URL query); once the catalog is
  // here — or the user is typing something new — show the live client count.
  const count =
    catalog === null && effectiveKey === urlKey && visible.length <= initial.total
      ? initial.total
      : visible.length

  return (
    <section className="relative mx-auto max-w-7xl px-4 pb-20 md:px-6">
      {/* Controls */}
      <div className="flex flex-col gap-4">
        {/* Category chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            type="button"
            onClick={() => setSearchQuery({ ...query, category: '' })}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-all ${
              !query.category
                ? 'bg-forest text-white shadow-md shadow-forest/20'
                : 'border border-moss/25 bg-white/80 text-forest hover:border-leaf/40 hover:bg-white'
            }`}
          >
            All categories
          </button>
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() =>
                setSearchQuery({ ...query, category: query.category === category ? '' : category })
              }
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                query.category === category
                  ? 'bg-forest text-white shadow-md shadow-forest/20'
                  : 'border border-moss/25 bg-white/80 text-forest hover:border-leaf/40 hover:bg-white'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Location + sort */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-pebble">
            <span className="font-bold text-forest">{count}</span> item
            {count === 1 ? '' : 's'} {effective.q.trim() ? `for "${effective.q.trim()}"` : 'nearby'}
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <select
                value={query.location}
                onChange={(e) => setSearchQuery({ ...query, location: e.target.value })}
                aria-label="Filter by location"
                className="cursor-pointer appearance-none rounded-full border border-moss/25 bg-white/80 py-2 pl-4 pr-9 text-xs font-semibold text-forest transition-colors hover:border-leaf/40 focus:border-leaf focus:outline-none"
              >
                <option value="">All locations</option>
                {locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
              <IconChevronDown
                size={14}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-pebble"
              />
            </div>

            <div className="relative">
              <select
                value={VALID_SORTS.has(query.sort) ? query.sort : 'newest'}
                onChange={(e) => setSearchQuery({ ...query, sort: e.target.value })}
                aria-label="Sort listings"
                className="cursor-pointer appearance-none rounded-full border border-moss/25 bg-white/80 py-2 pl-4 pr-9 text-xs font-semibold text-forest transition-colors hover:border-leaf/40 focus:border-leaf focus:outline-none"
              >
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
              <IconChevronDown
                size={14}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-pebble"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      {visible.length === 0 ? (
        <div className="mt-16 flex flex-col items-center rounded-3xl border border-dashed border-moss/40 bg-white/60 px-6 py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cream">
            <IconSearch size={26} className="text-moss" />
          </div>
          <h3 className="mt-5 text-lg font-bold text-forest">No items found</h3>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-pebble">
            {effective.q.trim() || effective.category || effective.location
              ? 'Try a different search term, category or location.'
              : 'Be the first to post a donation in your area.'}
          </p>
          <button
            type="button"
            onClick={() => router.push('/donation/new')}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-forest px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-forest/20 transition-all hover:bg-canopy"
          >
            <IconPlus size={16} />
            Post a donation
          </button>
        </div>
      ) : (
        <>
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {shown.map((listing) => (
              <ListingCard key={listing.id} listing={listing} viewerUserId={viewerUserId} />
            ))}
          </div>

          {hasMoreToShow && (
            <div className="mt-12 text-center">
              <button
                type="button"
                onClick={() => setVisibleLimit((n) => n + PAGE_SIZE)}
                className="inline-flex items-center gap-2 rounded-full border-2 border-forest/15 bg-white px-8 py-3 text-sm font-bold text-forest shadow-sm transition-all hover:border-forest/30 hover:shadow-md"
              >
                <IconPackage size={16} />
                Show more results ({visible.length - visibleLimit} remaining)
              </button>
            </div>
          )}
        </>
      )}
    </section>
  )
}
