import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  getSessionUserId,
  guestForbidden,
  isGuestRequest,
  unauthorized,
  uploadListingImage,
} from '@/lib/donations.server'

export const dynamic = 'force-dynamic'

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
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
      return NextResponse.json({ error: 'You can only manage your own listings' }, { status: 403 })
    }

    const contentType = request.headers.get('content-type') ?? ''
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json({ error: 'Expected an image upload' }, { status: 400 })
    }

    const formData = await request.formData()
    const file = formData.get('image')
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    const imageUrl = await uploadListingImage(file, id)
    if (!imageUrl) {
      return NextResponse.json({ error: 'Image upload failed' }, { status: 500 })
    }

    await prisma.donationListing.update({ where: { id }, data: { imageUrl } })

    return NextResponse.json({ imageUrl })
  } catch (error) {
    console.error('Error uploading listing image:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}