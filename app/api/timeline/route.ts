import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth.server'
import { prisma } from '@/lib/prisma'
import ImageKit, { toFile } from '@imagekit/nodejs'

const imagekit = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY ?? '',
})

function isGuestModeRequest(request: Request) {
  const cookieHeader = request.headers.get('cookie') ?? ''
  return cookieHeader.split(';').some((entry) => entry.trim().startsWith('vanashree-guest='))
}

function validateStringField(value: unknown, min: number, max: number) {
  return typeof value === 'string' && value.trim().length >= min && value.trim().length <= max
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const markerId = searchParams.get('markerId')

    if (!markerId) {
      return NextResponse.json({ error: 'markerId is required' }, { status: 400 })
    }

    const timelineEntries = await prisma.timelineEntry.findMany({
      where: { markerId },
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        title: true,
        description: true,
        imageUrl: true,
        date: true,
        createdAt: true,
        createdBy: {
          select: {
            fullName: true,
          },
        },
      },
    })

    return NextResponse.json({ timelineEntries })
  } catch (error) {
    console.error('Error fetching timeline entries:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    if (isGuestModeRequest(request)) {
      return NextResponse.json({ error: 'Guest users cannot add timeline entries.' }, { status: 403 })
    }

    const session = await getServerSession(authOptions)
    const userId = session?.user?.id
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const formData = await request.formData()
    const markerId = formData.get('markerId')
    const title = formData.get('title')
    const description = formData.get('description')
    const dateValue = formData.get('date')
    const image = formData.get('image') as File | null

    if (!validateStringField(markerId, 1, 100) || typeof markerId !== 'string') {
      return NextResponse.json({ error: 'Invalid markerId' }, { status: 400 })
    }

    if (!validateStringField(title, 3, 120)) {
      return NextResponse.json({ error: 'Title must be between 3 and 120 characters' }, { status: 400 })
    }

    if (!validateStringField(description, 10, 2000)) {
      return NextResponse.json({ error: 'Description must be between 10 and 2000 characters' }, { status: 400 })
    }

    const parsedDate = typeof dateValue === 'string' && dateValue.trim() ? new Date(dateValue) : new Date()
    if (Number.isNaN(parsedDate.getTime())) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 })
    }

    const marker = await prisma.mapMarker.findUnique({ where: { id: markerId }, select: { id: true } })
    if (!marker) {
      return NextResponse.json({ error: 'Marker not found' }, { status: 404 })
    }

    let imageUrl: string | null = null
    if (image && image.size > 0) {
      if (typeof image.type !== 'string' || !image.type.startsWith('image/') || image.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: 'Invalid image upload' }, { status: 400 })
      }

      const ext = image.type.split('/')[1] || 'jpg'
      try {
        const fileWithName = await toFile(image, `timeline-${markerId}.${ext}`, { type: image.type })
        const uploadResult = await imagekit.files.upload({
          file: fileWithName,
          fileName: `timeline-${markerId}.${Date.now()}.${ext}`,
          folder: '/timeline',
          useUniqueFileName: true,
          isPublished: true,
        })
        imageUrl = uploadResult.url || null
      } catch (err) {
        console.error('ImageKit upload failed for timeline entry', err)
        return NextResponse.json({ error: 'Image upload failed' }, { status: 500 })
      }
    }

    const entry = await prisma.timelineEntry.create({
      data: {
        markerId,
        createdById: userId,
        title: String(title).trim(),
        description: String(description).trim(),
        imageUrl,
        date: parsedDate,
      },
    })

    return NextResponse.json({ entry }, { status: 201 })
  } catch (error) {
    console.error('Error creating timeline entry:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
