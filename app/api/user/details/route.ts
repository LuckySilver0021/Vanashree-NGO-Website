import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ hasDetails: false })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
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

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const { name, age, location } = body

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      // Apparently should nt happen but still handling gracefully
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        fullName: name.trim(),
        age: typeof age === 'number' ? age : null,
        location: location?.trim() || null,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating user details:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
