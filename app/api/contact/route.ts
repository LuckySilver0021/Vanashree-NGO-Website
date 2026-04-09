import { NextRequest, NextResponse } from 'next/server'

// --- Simple in-memory rate limiter ---
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW_MS = 60 * 1000 // 1 minute
const MAX_REQUESTS_PER_WINDOW = 5

function isRateLimited(ip: string): boolean {
  const now = Date.now()

  // Small garbage collection: 10% chance on every request to clear old expired IPs
  // This prevents the Map from growing infinitely and causing a memory leak.
  if (Math.random() < 0.1) {
    for (const [key, value] of rateLimitMap.entries()) {
      if (now > value.resetTime) rateLimitMap.delete(key)
    }
  }

  const entry = rateLimitMap.get(ip)

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS })
    return false
  }

  entry.count++
  return entry.count > MAX_REQUESTS_PER_WINDOW
}

// --- Validation helpers ---
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_FIELD_LENGTH = 1000
const MAX_MESSAGE_LENGTH = 5000

function validateString(value: unknown, maxLen = MAX_FIELD_LENGTH): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= maxLen
}

const VOLUNTEER_SUBJECTS = ['Volunteering Inquiry']

export async function POST(request: NextRequest) {
  try {
    // --- Rate limiting ---
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded?.split(',')[0]?.trim() || 'unknown'

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { success: false, message: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    // --- Parse body ---
    const body = await request.json()

    // --- Honeypot check ---
    if (body.website) {
      // Silently succeed to not tip off bots
      return NextResponse.json({ success: true, message: 'Message sent successfully.' })
    }

    // --- Validate common required fields ---
    const { name, email, subject, message } = body

    if (!validateString(name)) {
      return NextResponse.json(
        { success: false, message: 'Name is required.' },
        { status: 400 }
      )
    }
    if (!validateString(email) || !EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { success: false, message: 'A valid email is required.' },
        { status: 400 }
      )
    }
    if (!validateString(subject)) {
      return NextResponse.json(
        { success: false, message: 'Subject is required.' },
        { status: 400 }
      )
    }
    if (!validateString(message, MAX_MESSAGE_LENGTH)) {
      return NextResponse.json(
        { success: false, message: 'Message is required (max 5000 characters).' },
        { status: 400 }
      )
    }

    // --- Validate hCaptcha token ---
    const captchaToken = body['h-captcha-response']
    if (!captchaToken || typeof captchaToken !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Please complete the captcha verification.' },
        { status: 400 }
      )
    }

    // --- Verify hCaptcha server-side with own secret key ---
    const hcaptchaSecret = process.env.HCAPTCHA_SECRET_KEY
    if (!hcaptchaSecret) {
      console.error('HCAPTCHA_SECRET_KEY is not set in environment variables.')
      return NextResponse.json(
        { success: false, message: 'Server configuration error. Please try again later.' },
        { status: 500 }
      )
    }
    const hcaptchaVerifyRes = await fetch('https://api.hcaptcha.com/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret: hcaptchaSecret, response: captchaToken }),
    })
    const hcaptchaData = await hcaptchaVerifyRes.json() as { success: boolean }
    if (!hcaptchaData.success) {
      return NextResponse.json(
        { success: false, message: 'Captcha verification failed. Please try again.' },
        { status: 400 }
      )
    }

    // --- Validate volunteer fields if subject is volunteering ---
    const isVolunteer = VOLUNTEER_SUBJECTS.includes(subject)

    if (isVolunteer) {
      const volunteerFields = ['phone', 'location', 'preferredRole', 'skills', 'education', 'experience']
      for (const field of volunteerFields) {
        if (!validateString(body[field])) {
          return NextResponse.json(
            { success: false, message: `${field} is required for volunteer inquiries.` },
            { status: 400 }
          )
        }
      }
    }

    // --- Build payload for Web3Forms ---
    const accessKey = process.env.WEB3FORMS_ACCESS_KEY
    if (!accessKey) {
      console.error('WEB3FORMS_ACCESS_KEY is not set in environment variables.')
      return NextResponse.json(
        { success: false, message: 'Server configuration error. Please try again later.' },
        { status: 500 }
      )
    }

    const web3formsPayload: Record<string, string> = {
      access_key: accessKey,
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      message: message.trim(),
      from_name: 'Vanashree Website',
      'h-captcha-response': captchaToken,
    }

    if (isVolunteer) {
      web3formsPayload.phone = body.phone.trim()
      web3formsPayload.location = body.location.trim()
      web3formsPayload.preferredRole = body.preferredRole.trim()
      web3formsPayload.skills = body.skills.trim()
      web3formsPayload.education = body.education.trim()
      web3formsPayload.experience = body.experience.trim()
    }

    // --- Forward to Web3Forms ---
    const web3Response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Vanashree-Website/1.0',
      },
      body: JSON.stringify(web3formsPayload),
      cache: 'no-store',
    })

    const responseText = await web3Response.text()

    // Web3Forms may return HTML error pages instead of JSON
    let web3Data
    try {
      web3Data = JSON.parse(responseText)
    } catch {
      console.error('Web3Forms returned non-JSON response:', responseText.substring(0, 500))
      return NextResponse.json(
        { success: false, message: 'Failed to send message. The email service returned an unexpected response.' },
        { status: 502 }
      )
    }

    if (web3Data.success) {
      return NextResponse.json({ success: true, message: 'Message sent successfully!' })
    } else {
      console.error('Web3Forms error:', web3Data)
      return NextResponse.json(
        { success: false, message: web3Data.message || 'Failed to send message. Please try again.' },
        { status: 502 }
      )
    }
  } catch (error) {
    console.error('Contact API error:', error)
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
