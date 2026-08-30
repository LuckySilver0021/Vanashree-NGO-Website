import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { DonationStatus } from '@/lib/donations'
import {
  getSessionUserId,
  guestForbidden,
  isGuestRequest,
  listingCreateSchema,
  listingQuerySchema,
  queryListings,
  serializeListing,
  unauthorized,
} from '@/lib/donations.server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const parsed = listingQuerySchema.safeParse({
      q: searchParams.get('q') ?? undefined,
      category: searchParams.get('category') ?? undefined,
      location: searchParams.get('location') ?? undefined,
      sort: searchParams.get('sort') ?? undefined,
      page: searchParams.get('page') ?? undefined,
      take: searchParams.get('take') ?? undefined,
      all: searchParams.get('all') ?? undefined,
      mine: searchParams.get('mine') ?? undefined,
      favorites: searchParams.get('favorites') ?? undefined,
      status: searchParams.get('status') ?? undefined,
    })

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid query parameters' }, { status: 400 })
    }

    const userId = await getSessionUserId()
    const { q, category, location, sort, page, take, all, mine, favorites, status } = parsed.data

    const statuses: DonationStatus[] | undefined =
      status === 'all'
        ? undefined
        : status === 'reserved' || status === 'donated'
          ? [status]
          : ['available', 'reserved']

    const result = await queryListings({
      q,
      category,
      location,
      sort,
      page,
      take,
      all,
      mine,
      favorites,
      statuses,
      sellerId: userId ?? undefined,
      userId,
    })

    return NextResponse.json(result, {
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch (error) {
    console.error('Error listing donations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    if (isGuestRequest(request)) return guestForbidden()

    const userId = await getSessionUserId()
    if (!userId) return unauthorized()

    const contentType = request.headers.get('content-type') ?? ''
    if (!contentType.includes('multipart/form-data') && !contentType.includes('application/x-www-form-urlencoded')) {
      return NextResponse.json({ error: 'Invalid request format' }, { status: 400 })
    }

    const formData = await request.formData()
    const parsed = listingCreateSchema.safeParse({
      title: formData.get('title'),
      description: formData.get('description'),
      category: formData.get('category'),
      condition: formData.get('condition'),
      location: formData.get('location'),
      lat: formData.get('lat'),
      lng: formData.get('lng'),
    })

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? 'Invalid listing details'
      return NextResponse.json({ error: firstError }, { status: 400 })
    }

    const seller = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    })
    if (!seller) {
      return NextResponse.json({ error: 'Account no longer exists. Please sign in again.' }, { status: 401 })
    }

    const { title, description, category, condition, location } = parsed.data

    let lat: number | null = null
    let lng: number | null = null
    if (parsed.data.lat != null && parsed.data.lng != null) {
      lat = parsed.data.lat
      lng = parsed.data.lng
    }

    const result = await prisma.donationListing.create({
      data: {
        title,
        description,
        category,
        condition,
        location,
        lat,
        lng,
        sellerId: seller.id,
      },
      include: {
        seller: { select: { id: true, fullName: true } },
        _count: { select: { favourites: true } },
      },
    })

    return NextResponse.json({ listing: serializeListing(result) }, { status: 201 })
  } catch (error) {
    console.error('Error creating donation listing:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
