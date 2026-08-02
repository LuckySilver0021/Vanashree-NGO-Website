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
  uploadListingImage,
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
      price: formData.get('price'),
      category: formData.get('category'),
      condition: formData.get('condition'),
      location: formData.get('location'),
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

    const { title, description, price, category, condition, location } = parsed.data

    const listing = await prisma.donationListing.create({
      data: {
        title,
        description,
        price,
        category,
        condition,
        location,
        sellerId: seller.id,
      },
      include: {
        seller: { select: { id: true, fullName: true } },
        _count: { select: { favourites: true } },
      },
    })

    let imageUrl: string | null = null
    const file = formData.get('image')
    if (file instanceof File) {
      try {
        imageUrl = await uploadListingImage(file, listing.id)
      } catch (err) {
        console.error('Failed to upload listing image:', err)
      }
    }

    let result = listing
    if (imageUrl) {
      try {
        result = await prisma.donationListing.update({
          where: { id: listing.id },
          data: { imageUrl },
          include: {
            seller: { select: { id: true, fullName: true } },
            _count: { select: { favourites: true } },
          },
        })
      } catch (err) {
        console.error('Failed to attach image to listing:', err)
      }
    }

    return NextResponse.json({ listing: serializeListing(result) }, { status: 201 })
  } catch (error) {
    console.error('Error creating donation listing:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
