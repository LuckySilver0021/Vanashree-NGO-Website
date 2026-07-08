import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth.server'
import { prisma } from '@/lib/prisma'
import ImageKit, { toFile } from '@imagekit/nodejs'

const imagekit = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY ?? '',
})

function isSafeMarkerPayload(lat: number, lng: number, label: string) {
  return Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180 && label.length <= 120
}

export async function GET() {
  try {
    const markers = await prisma.mapMarker.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { fullName: true } },
      },
    })

    return NextResponse.json({ markers })
  } catch (error) {
    console.error('Error fetching markers:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function isGuestModeRequest(request: Request) {
  const cookieHeader = request.headers.get('cookie') ?? ''
  return cookieHeader.split(';').some((entry) => entry.trim().startsWith('vanashree-guest='))
}

export async function POST(request: Request) {
  try {
    if (isGuestModeRequest(request)) {
      return NextResponse.json({ error: 'Guest users can only view existing saplings.' }, { status: 403 })
    }

    const session = await getServerSession(authOptions)

    const userId = session?.user?.id
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const formData = await request.formData()
    const lat = Number(formData.get('lat'))
    const lng = Number(formData.get('lng'))
    const label = String(formData.get('label') || '')
    const file = formData.get('image') as File | null

    console.log('marker upload request received', {
      userId,
      lat,
      lng,
      labelLength: label.length,
      hasImage: !!file,
      imageType: file?.type,
      imageSize: file?.size,
    })

    if (!isSafeMarkerPayload(lat, lng, label)) {
      return NextResponse.json({ error: 'Invalid coordinates or label' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    })

    const marker = await prisma.mapMarker.create({
      data: {
        lat,
        lng,
        label: label?.trim() || null,
        userId: user?.id ?? null,
      },
      include: {
        user: {
          select: {
            fullName: true,
          },
        },
      },
    })

    let imageUrl: string | null = null
    try {
      const image = file
      if (image && image.size > 0) {
        if (!image.type.startsWith('image/') || image.size > 5 * 1024 * 1024) {
          throw new Error('Invalid image upload')
        }

        const ext = image.type.split('/')[1] || 'jpg'
        console.log('starting image upload to ImageKit', { type: image.type, size: image.size })
        const fileWithName = await toFile(image, `marker-${marker.id}.${ext}`, { type: image.type })
        const uploadResult = await imagekit.files.upload({
          file: fileWithName,
          fileName: `marker-${marker.id}.${ext}`,
          folder: '/markers',
          useUniqueFileName: true,
          isPublished: true,
        })

        console.log('imagekit upload result', {
          filePath: uploadResult?.filePath,
          fileId: uploadResult?.fileId,
        })

        const urlCandidate = uploadResult.url || uploadResult.thumbnailUrl || null
        if (typeof urlCandidate === 'string' && urlCandidate.trim()) {
          imageUrl = urlCandidate.trim()
        } else if (typeof uploadResult.filePath === 'string' && process.env.IMAGEKIT_URL_ENDPOINT) {
          const endpoint = process.env.IMAGEKIT_URL_ENDPOINT.replace(/\/$/, '')
          imageUrl = `${endpoint}${uploadResult.filePath}`
        }
      } else {
        console.log('no image file included in request or file is empty')
      }
    } catch (err) {
      console.error('Failed to upload marker image to ImageKit', err)
    }

    let result = marker
    if (imageUrl) {
      try {
        result = await prisma.mapMarker.update({
          where: { id: marker.id },
          data: { imageUrl },
          include: { user: { select: { fullName: true } } },
        })
      } catch (err) {
        console.error('Failed to update marker with imageUrl', err)
      }
    }

    return NextResponse.json({ marker: result }, { status: 201 })
  } catch (error) {
    console.error('Error creating marker:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    const userId = session?.user?.id
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Marker ID required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    })

    const marker = await prisma.mapMarker.findUnique({
      where: { id },
      select: { userId: true },
    })

    if (!marker) {
      return NextResponse.json({ error: 'Marker not found' }, { status: 404 })
    }

    // Only allow deleting own markers or if user is admin
    if (marker.userId && marker.userId !== user?.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    await prisma.mapMarker.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting marker:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
