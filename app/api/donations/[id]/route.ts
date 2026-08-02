import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  getSessionUserId,
  guestForbidden,
  isGuestRequest,
  listingPatchSchema,
  serializeListing,
  unauthorized,
} from '@/lib/donations.server'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const userId = await getSessionUserId()

    const listing = await prisma.donationListing.findUnique({
      where: { id },
      include: {
        seller: { select: { id: true, fullName: true } },
        _count: { select: { favourites: true } },
        ...(userId ? { favourites: { where: { userId }, select: { userId: true }, take: 1 } } : {}),
      },
    })

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    return NextResponse.json({ listing: serializeListing(listing) })
  } catch (error) {
    console.error('Error fetching donation listing:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    if (isGuestRequest(request)) return guestForbidden()

    const userId = await getSessionUserId()
    if (!userId) return unauthorized()

    const { id } = await context.params
    const body = await request.json().catch(() => null)
    const parsed = listingPatchSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 })
    }

    const existing = await prisma.donationListing.findUnique({
      where: { id },
      select: { sellerId: true },
    })
    if (!existing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }
    if (existing.sellerId !== userId) {
      return NextResponse.json({ error: 'You can only manage your own listings' }, { status: 403 })
    }

    const listing = await prisma.donationListing.update({
      where: { id },
      data: { status: parsed.data.status },
      include: {
        seller: { select: { id: true, fullName: true } },
        _count: { select: { favourites: true } },
      },
    })

    return NextResponse.json({ listing: serializeListing(listing) })
  } catch (error) {
    console.error('Error updating donation listing:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    if (isGuestRequest(request)) return guestForbidden()

    const userId = await getSessionUserId()
    if (!userId) return unauthorized()

    const { id } = await context.params

    const existing = await prisma.donationListing.findUnique({
      where: { id },
      select: { sellerId: true },
    })
    if (!existing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }
    if (existing.sellerId !== userId) {
      return NextResponse.json({ error: 'You can only delete your own listings' }, { status: 403 })
    }

    await prisma.donationListing.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting donation listing:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
