import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth.server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    const userId = session?.user?.id
    if (!userId) {
      return NextResponse.json({ hasDetails: false })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { fullName: true, age: true, location: true },
    })

    if (!user) {
      return NextResponse.json({ hasDetails: false })
    }

    const hasDetails = !!(user.fullName && (user.age || user.location))

    return NextResponse.json({ hasDetails, user })
  } catch {
    return NextResponse.json({ hasDetails: false })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    const userId = session?.user?.id
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const { name, age, location } = body

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        fullName: name.trim(),
        age: typeof age === 'number' ? age : null,
        location: typeof location === 'string' ? location.trim() || null : null,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating user details:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
