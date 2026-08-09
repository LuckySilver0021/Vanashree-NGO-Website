import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  getSessionUserId,
  guestForbidden,
  isGuestRequest,
  unauthorized,
} from '@/lib/donations.server'

export const dynamic = 'force-dynamic'

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    if (isGuestRequest(request)) return guestForbidden()

    const userId = await getSessionUserId()
    if (!userId) return unauthorized()

    const { id } = await context.params

    const listing = await prisma.donationListing.findUnique({
      where: { id },
      select: { id: true, status: true },
    })
    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }
    if (listing.status === 'donated') {
      return NextResponse.json({ error: 'Donated items cannot be favourited' }, { status: 400 })
    }

    const existing = await prisma.favouriteListing.findUnique({
      where: { userId_listingId: { userId, listingId: id } },
    })

    if (existing) {
      await prisma.favouriteListing.delete({
        where: { userId_listingId: { userId, listingId: id } },
      })
      return NextResponse.json({ favourited: false })
    }

    await prisma.favouriteListing.create({
      data: { userId, listingId: id },
    })

    return NextResponse.json({ favourited: true })
  } catch (error) {
    console.error('Error toggling favourite:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
