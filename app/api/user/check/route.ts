import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json({ exists: false }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    })

    return NextResponse.json({ exists: !!user })
  } catch (error) {
    console.error('Error checking user:', error)
    return NextResponse.json({ exists: false }, { status: 500 })
  }
}
