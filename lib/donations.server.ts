import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth.server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@/lib/generated/prisma/client'
import ImageKit, { toFile } from '@imagekit/nodejs'
import { DONATION_CONDITIONS, DONATION_STATUSES, MAX_IMAGE_SIZE, type DonationStatus, type ListingDTO, type QueryListingsResult } from '@/lib/donations'

export const listingSortSchema = z.enum(['newest', 'oldest', 'popular'])

const boolQuery = z
  .enum(['true', 'false', '1', '0'])
  .optional()
  .default('false')
  .transform((value) => value === 'true' || value === '1')

export const listingQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
  category: z.string().trim().max(60).optional(),
  location: z.string().trim().max(60).optional(),
  sort: listingSortSchema.default('newest'),
  page: z.coerce.number().int().min(1).max(100).default(1),
  take: z.coerce.number().int().min(1).max(24).default(12),
  all: boolQuery,
  mine: boolQuery,
  favorites: boolQuery,
  status: z.string().trim().max(20).optional(),
})

export const listingCreateSchema = z.object({
  title: z.string().trim().min(4, 'Title must be at least 4 characters').max(100, 'Title must be under 100 characters'),
  description: z.string().trim().max(2000, 'Description must be under 2000 characters'),
  category: z.string().trim().min(1).max(60),
  condition: z.enum(DONATION_CONDITIONS),
  location: z.string().trim().min(2, 'Location is required').max(60),
  lat: z.coerce.number().min(-90).max(90).nullish(),
  lng: z.coerce.number().min(-180).max(180).nullish(),
})

export const listingPatchSchema = z.object({
  status: z.enum(DONATION_STATUSES),
})

export function isGuestRequest(request: Request) {
  const cookieHeader = request.headers.get('cookie') ?? ''
  return cookieHeader.split(';').some((entry) => entry.trim().startsWith('vanashree-guest='))
}

export async function getSessionUserId() {
  const session = await getServerSession(authOptions)
  return session?.user?.id ?? null
}

export function unauthorized() {
  return NextResponse.json({ error: 'Not authenticated. Please sign in first.' }, { status: 401 })
}

export function guestForbidden() {
  return NextResponse.json(
    { error: 'Guest mode is read-only. Create an account or sign in to post donations.' },
    { status: 403 }
  )
}

export function serializeListing(
  listing: {
    id: string
    title: string
    description: string
    category: string
    condition: string
    location: string
    lat?: number | null
    lng?: number | null
    imageUrl: string | null
    status: string
    createdAt: Date
    updatedAt: Date
    seller: { id: string; fullName: string; phone?: string | null }
    _count?: { favourites: number }
    favourites?: Array<{ userId: string }>
  }
): ListingDTO {
  return {
    id: listing.id,
    title: listing.title,
    description: listing.description,
    category: listing.category,
    condition: listing.condition,
    location: listing.location,
    lat: listing.lat ?? null,
    lng: listing.lng ?? null,
    imageUrl: listing.imageUrl,
    status: listing.status as DonationStatus,
    createdAt: listing.createdAt.toISOString(),
    updatedAt: listing.updatedAt.toISOString(),
    seller: listing.seller,
    favouriteCount: listing._count?.favourites ?? 0,
    favouritedByMe: (listing.favourites?.length ?? 0) > 0,
  }
}

export interface QueryListingsInput {
  q?: string
  category?: string
  location?: string
  sort?: z.infer<typeof listingSortSchema>
  page?: number
  take?: number
  all?: boolean
  mine?: boolean
  favorites?: boolean
  statuses?: DonationStatus[]
  sellerId?: string
  userId?: string | null
}

/** Upper bound for catalog (client-side instant search) fetches. */
const CATALOG_LIMIT = 500

export async function queryListings(input: QueryListingsInput): Promise<QueryListingsResult> {
  const all = input.all === true
  const page = all ? 1 : Math.max(1, input.page ?? 1)
  const take = all ? CATALOG_LIMIT : Math.min(24, Math.max(1, input.take ?? 12))
  const q = input.q?.trim()
  const userId = input.userId ?? null

  const where: Prisma.DonationListingWhereInput = {}

  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
      { location: { contains: q, mode: 'insensitive' } },
    ]
  }

  if (input.category) where.category = input.category
  if (input.location) where.location = input.location
  if (input.statuses) where.status = { in: input.statuses }
  if (input.mine && input.sellerId) where.sellerId = input.sellerId
  if (input.favorites) where.favourites = { some: { userId: userId ?? '__none__' } }

  const orderBy: Prisma.DonationListingOrderByWithRelationInput[] = (() => {
    switch (input.sort) {
      case 'oldest':
        return [{ createdAt: 'asc' }]
      case 'popular':
        return [{ favourites: { _count: 'desc' } }, { createdAt: 'desc' }]
      default:
        return [{ createdAt: 'desc' }]
    }
  })()

  const [listings, total] = await Promise.all([
    prisma.donationListing.findMany({
      where,
      orderBy,
      skip: (page - 1) * take,
      take: take + 1,
      include: {
        seller: { select: { id: true, fullName: true, phone: true } },
        _count: { select: { favourites: true } },
        ...(userId ? { favourites: { where: { userId }, select: { userId: true }, take: 1 } } : {}),
      },
    }),
    prisma.donationListing.count({ where }),
  ])

  const hasMore = listings.length > take
  const trimmed = hasMore ? listings.slice(0, take) : listings

  return {
    listings: trimmed.map(serializeListing),
    page,
    total,
    totalPages: Math.max(1, Math.ceil(total / take)),
    hasMore,
    exhaustive: all ? total <= take : undefined,
  }
}

export async function uploadListingImage(file: File, listingId: string) {
  if (!file || file.size === 0) return null
  if (!file.type.startsWith('image/')) {
    throw new Error('Only image files are allowed')
  }
  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error('Image must be smaller than 5MB')
  }

  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY ?? ''
  if (!privateKey) return null

  const imagekit = new ImageKit({ privateKey })
  const ext = file.type.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg'
  const fileName = `listing-${listingId}-${Date.now()}.${ext}`
  const fileWithName = await toFile(file, fileName, { type: file.type })

  const result = await imagekit.files.upload({
    file: fileWithName,
    fileName,
    folder: '/donations',
    useUniqueFileName: true,
    isPublished: true,
  })

  const urlCandidate = result.url || result.thumbnailUrl || null
  if (typeof urlCandidate === 'string' && urlCandidate.trim()) {
    return urlCandidate.trim()
  }
  if (typeof result.filePath === 'string' && process.env.IMAGEKIT_URL_ENDPOINT) {
    const endpoint = process.env.IMAGEKIT_URL_ENDPOINT.replace(/\/$/, '')
    return `${endpoint}${result.filePath}`
  }
  return null
}
