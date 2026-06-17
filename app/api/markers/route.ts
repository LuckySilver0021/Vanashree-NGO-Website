import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const markers = await prisma.mapMarker.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { fullName: true } },
      },
    })

    // Ensure markers include an `imageUrl` if a file exists on disk (fallback if DB wasn't updated yet)
    try {
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
      const allowedExt = ['png', 'jpg', 'jpeg', 'webp']
      const enhanced = markers.map((m) => {
        // If DB already has imageUrl, keep it
        if ((m as any).imageUrl) return m
        try {
          for (const ext of allowedExt) {
            const filename = `${m.id}.${ext}`
            const filepath = path.join(uploadsDir, filename)
            if (fs.existsSync(filepath)) {
              return { ...(m as any), imageUrl: `/uploads/${filename}` }
            }
          }
        } catch (_) {
          // ignore
        }
        return { ...(m as any), imageUrl: null }
      })

      return NextResponse.json({ markers: enhanced })
    } catch (err) {
      return NextResponse.json({ markers })
    }
  } catch (error) {
    console.error('Error fetching markers:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const { lat, lng, label, imageData } = body

    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return NextResponse.json({ error: 'lat and lng are required numbers' }, { status: 400 })
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    })

    const marker = await prisma.mapMarker.create({
      data: {
        lat,
        lng,
        label: label?.trim() || null,
        userId: user?.id || null,
      },
      include: {
        user: {
          select: {
            fullName: true,
          },
        },
      },
    })

    // If an imageData (data URL) was provided, save it to public/uploads/<markerId>.<ext>
    let imageUrl: string | null = null
    try {
      if (imageData && typeof imageData === 'string') {
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
        if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })

        const match = imageData.match(/^data:(image\/(png|jpeg|jpg|webp));base64,(.+)$/)
        if (match) {
          const mime = match[1]
          const ext = match[2] === 'jpeg' ? 'jpg' : match[2]
          const b64 = match[3]
          const buffer = Buffer.from(b64, 'base64')
          const filename = `${marker.id}.${ext}`
          const filepath = path.join(uploadsDir, filename)
          await fs.promises.writeFile(filepath, buffer)
          imageUrl = `/uploads/${filename}`
        }
      }
    } catch (err) {
      console.error('Failed to save marker image', err)
    }
    // If we saved an image, persist the imageUrl in the DB for this marker
    let result: any = marker
    if (imageUrl) {
      try {
        // cast data to any to avoid type mismatch until Prisma client is regenerated
        result = await prisma.mapMarker.update({
          where: { id: marker.id },
          // @ts-ignore - imageUrl may not be present in generated types until prisma generate
          data: { imageUrl: imageUrl } as any,
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

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Marker ID required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
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
