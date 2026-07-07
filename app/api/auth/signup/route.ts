import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { isValidEmail, isValidPhone, normalizeEmail, normalizePhone, sanitizeName } from '@/lib/auth'

const TEMP_MAIL_DOMAINS = [
  'mailinator.com',
  'tempmail.com',
  '10minutemail.com',
  'guerrillamail.com',
  'maildrop.cc',
  'dispostable.com',
  'trashmail.com',
]

function isTemporaryEmail(email: string) {
  const domain = email.split('@')[1]?.toLowerCase()
  return !!domain && TEMP_MAIL_DOMAINS.includes(domain)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { fullName, email, phone, password, confirmPassword } = body

    const normalizedFullName = typeof fullName === 'string' ? sanitizeName(fullName) : ''
    const normalizedEmail = typeof email === 'string' ? normalizeEmail(email) : ''
    const normalizedPhone = typeof phone === 'string' ? normalizePhone(phone) : ''

    if (normalizedFullName.length < 2) {
      return NextResponse.json(
        { error: 'Full name must be at least 2 characters' },
        { status: 400 }
      )
    }

    if (!isValidEmail(normalizedEmail)) {
      return NextResponse.json(
        { error: 'Valid email address is required' },
        { status: 400 }
      )
    }

    if (isTemporaryEmail(normalizedEmail)) {
      return NextResponse.json(
        { error: 'Temporary email addresses are not supported' },
        { status: 400 }
      )
    }

    if (!isValidPhone(normalizedPhone)) {
      return NextResponse.json(
        { error: 'Please enter a valid 10-digit Indian mobile number' },
        { status: 400 }
      )
    }

    if (typeof password !== 'string' || password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      )
    }

    const [existingEmail, existingPhone] = await Promise.all([
      prisma.user.findUnique({ where: { email: normalizedEmail }, select: { id: true } }),
      prisma.user.findUnique({ where: { phone: normalizedPhone }, select: { id: true } }),
    ])

    if (existingEmail || existingPhone) {
      return NextResponse.json(
        {
          error: existingEmail ? 'Email already registered' : 'Phone number already registered',
        },
        { status: 409 }
      )
    }

    const salt = await bcrypt.genSalt(12)
    const hashedPassword = await bcrypt.hash(password, salt)

    const user = await prisma.user.create({
      data: {
        fullName: normalizedFullName,
        email: normalizedEmail,
        phone: normalizedPhone,
        hashedPassword,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
      },
    })

    return NextResponse.json(
      { success: true, user, message: 'Account created successfully' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating account:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
