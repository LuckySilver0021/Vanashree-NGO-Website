'use client'

import { FormEvent, useEffect, useRef, useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  IconAlertCircle,
  IconArrowLeft,
  IconCircleCheck,
  IconCheck,
  IconLeaf,
  IconLoader2,
  IconLock,
  IconMail,
  IconPhone,
  IconShieldCheck,
  IconSparkles,
  IconUser,
} from '@tabler/icons-react'
import { toast, Toaster } from 'sonner'
import { FadeIn } from '@/components/motion/FadeIn'
import { isValidEmail, isValidPhone, normalizeEmail, normalizePhone, sanitizeName } from '@/lib/auth'

type AuthMode = 'login' | 'signup'
type EmailCheckState = 'idle' | 'checking' | 'available' | 'exists' | 'invalid' | 'temp-mail'

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

export default function AuthPage() {
  const router = useRouter()
  const [mode, setMode] = useState<AuthMode>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [loginData, setLoginData] = useState({ email: '', password: '' })
  const [signupData, setSignupData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [emailCheckState, setEmailCheckState] = useState<EmailCheckState>('idle')
  const [emailCheckMessage, setEmailCheckMessage] = useState('')
  const emailToastRef = useRef<string | number | null>(null)

  useEffect(() => {
    const email = signupData.email.trim().toLowerCase()

    if (!email) {
      setEmailCheckState('idle')
      setEmailCheckMessage('')
      if (emailToastRef.current) {
        toast.dismiss(emailToastRef.current)
        emailToastRef.current = null
      }
      return
    }

    if (!isValidEmail(email)) {
      setEmailCheckState('invalid')
      setEmailCheckMessage('Please enter a valid email address')
      if (emailToastRef.current) {
        toast.dismiss(emailToastRef.current)
        emailToastRef.current = null
      }
      return
    }

    if (isTemporaryEmail(email)) {
      setEmailCheckState('temp-mail')
      setEmailCheckMessage('Temporary email addresses are not supported')
      if (emailToastRef.current) {
        toast.dismiss(emailToastRef.current)
        emailToastRef.current = null
      }
      return
    }

    setEmailCheckState('checking')
    setEmailCheckMessage('Checking availability…')
    if (emailToastRef.current) {
      toast.dismiss(emailToastRef.current)
    }
    emailToastRef.current = toast.loading('Checking if this email is already registered…')

    const timeoutId = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/user/check?email=${encodeURIComponent(email)}`)
        const data = await res.json()

        if (data.exists) {
          setEmailCheckState('exists')
          setEmailCheckMessage('This email is already registered')
          if (emailToastRef.current) {
            toast.dismiss(emailToastRef.current)
          }
          toast.error('This email is already registered')
          emailToastRef.current = null
        } else {
          setEmailCheckState('available')
          setEmailCheckMessage('Email is available')
          if (emailToastRef.current) {
            toast.dismiss(emailToastRef.current)
          }
          emailToastRef.current = null
        }
      } catch {
        setEmailCheckState('idle')
        setEmailCheckMessage('')
        if (emailToastRef.current) {
          toast.dismiss(emailToastRef.current)
        }
        emailToastRef.current = null
      }
    }, 500)

    return () => {
      window.clearTimeout(timeoutId)
      if (emailToastRef.current) {
        toast.dismiss(emailToastRef.current)
        emailToastRef.current = null
      }
    }
  }, [signupData.email])

  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const email = normalizeEmail(loginData.email)
      const password = loginData.password

      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError(result.error)
      } else if (result?.ok) {
        setSuccessMessage('Login successful! Redirecting...')
        setTimeout(() => router.replace('/maps?loggedIn=true'), 1500)
      }
    } catch {
      setError('An error occurred during login')
    } finally {
      setLoading(false)
    }
  }

  const handleSignupSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const fullName = sanitizeName(signupData.fullName)
      const email = normalizeEmail(signupData.email)
      const phone = normalizePhone(signupData.phone)
      const password = signupData.password
      const confirmPassword = signupData.confirmPassword

      if (fullName.length < 2) {
        setError('Please enter your full name')
        return
      }

      if (!isValidEmail(email)) {
        setError('Please enter a valid email address')
        return
      }

      if (isTemporaryEmail(email)) {
        setError('Temporary email addresses are not supported')
        return
      }

      if (!isValidPhone(phone)) {
        setError('Please enter a valid 10-digit Indian mobile number')
        return
      }

      if (password.length < 8) {
        setError('Password must be at least 8 characters')
        return
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match')
        return
      }

      if (emailCheckState === 'checking') {
        setError('Please wait while we verify the email')
        return
      }

      if (emailCheckState === 'exists') {
        setError('This email is already registered')
        return
      }

      const payload = {
        fullName,
        email,
        phone,
        password,
        confirmPassword,
      }

      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Signup failed')
        return
      }

      setSuccessMessage('Account created! Signing you in...')
      setSignupData({ fullName: '', email: '', phone: '', password: '', confirmPassword: '' })
      setEmailCheckState('idle')
      setEmailCheckMessage('')

      setTimeout(async () => {
        const loginResult = await signIn('credentials', {
          email: payload.email,
          password: payload.password,
          redirect: false,
        })

        if (loginResult?.ok) {
          router.replace('/maps?loggedIn=true')
        } else {
          setError('Account created, but automatic sign-in failed. Please sign in manually.')
        }
      }, 1000)
    } catch {
      setError('An error occurred during signup')
    } finally {
      setLoading(false)
    }
  }

  const isSignupReady =
    signupData.fullName.trim().length > 1 &&
    emailCheckState === 'available' &&
    signupData.phone.replace(/\\D/g, '').length === 10 &&
    signupData.password.length >= 8 &&
    signupData.confirmPassword.length >= 8 &&
    signupData.password === signupData.confirmPassword

  return (
    <section className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(168,197,122,0.22),transparent_32%),linear-gradient(135deg,#f7f8f2_0%,#eef2e6_50%,#f9f4e8_100%)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(28,59,15,0.05),transparent_30%,rgba(200,160,81,0.06))]" />
      <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-leaf/10 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen max-w-2xl items-center justify-center">
        <FadeIn direction="right" className="w-full">
          <div className="rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-[0_24px_80px_-30px_rgba(28,59,15,0.35)] backdrop-blur-xl sm:p-8">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-pebble">Welcome</p>
                  <h2 className="mt-1 text-2xl font-semibold text-forest">
                    {mode === 'login' ? 'Sign in' : 'Create account'}
                  </h2>
                </div>
                <div className="flex rounded-full bg-cream p-1">
                  {(['login', 'signup'] as AuthMode[]).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        setMode(option)
                        setError('')
                        setSuccessMessage('')
                      }}
                      className={`rounded-full px-3 py-2 text-sm font-medium transition-all ${mode === option ? 'bg-forest text-white shadow-sm shadow-forest/20' : 'text-stone hover:text-forest'}`}
                    >
                      {option === 'login' ? 'Sign in' : 'Create account'}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="mb-4 flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  <IconAlertCircle size={16} className="mt-0.5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              {successMessage && (
                <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-center text-sm font-medium text-emerald-700">
                  {successMessage}
                </div>
              )}

              {mode === 'login' ? (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-forest">Email address</label>
                    <div className="relative">
                      <IconMail size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-pebble" />
                      <input
                        type="email"
                        required
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        placeholder="you@example.com"
                        className="w-full rounded-2xl border border-moss/25 bg-cream/40 py-3 pl-10 pr-4 text-sm text-forest placeholder:text-pebble focus:border-leaf focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-forest">Password</label>
                    <div className="relative">
                      <IconLock size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-pebble" />
                      <input
                        type="password"
                        required
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        placeholder="••••••••"
                        className="w-full rounded-2xl border border-moss/25 bg-cream/40 py-3 pl-10 pr-4 text-sm text-forest placeholder:text-pebble focus:border-leaf focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-forest px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-forest/20 transition-all hover:bg-canopy disabled:cursor-not-allowed disabled:bg-stone/40"
                  >
                    {loading ? (
                      <>
                        <IconLoader2 size={16} className="animate-spin" /> Signing in...
                      </>
                    ) : (
                      'Sign in'
                    )}
                  </button>

                  <div className="text-center text-sm text-stone">
                    New here?{' '}
                    <button type="button" onClick={() => setMode('signup')} className="font-semibold text-leaf hover:text-forest">
                      Create an account
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleSignupSubmit} className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-forest">Full name</label>
                    <div className="relative">
                      <IconUser size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-pebble" />
                      <input
                        type="text"
                        required
                        value={signupData.fullName}
                        onChange={(e) => setSignupData((prev) => ({ ...prev, fullName: e.target.value }))}
                        placeholder="Aarav Sharma"
                        className="w-full rounded-2xl border border-moss/25 bg-cream/40 py-3 pl-10 pr-4 text-sm text-forest placeholder:text-pebble focus:border-leaf focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-forest">Email address</label>
                    <div className="relative">
                      <IconMail size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-pebble" />
                      <input
                        type="email"
                        required
                        value={signupData.email}
                        onChange={(e) => setSignupData((prev) => ({ ...prev, email: e.target.value }))}
                        placeholder="you@example.com"
                        className="w-full rounded-2xl border border-moss/25 bg-cream/40 py-3 pl-10 pr-4 text-sm text-forest placeholder:text-pebble focus:border-leaf focus:outline-none"
                      />
                    </div>
                    {emailCheckMessage ? (
                      <p className={`mt-2 text-sm ${emailCheckState === 'available' ? 'text-emerald-600' : emailCheckState === 'exists' || emailCheckState === 'temp-mail' || emailCheckState === 'invalid' ? 'text-red-600' : 'text-stone-600'}`}>
                        {emailCheckState === 'available' ? <IconCheck size={14} className="mr-1 inline" /> : null}
                        {emailCheckMessage}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-forest">Phone number</label>
                    <div className="relative">
                      <IconPhone size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-pebble" />
                      <input
                        type="tel"
                        required
                        value={signupData.phone}
                        onChange={(e) => setSignupData((prev) => ({ ...prev, phone: e.target.value }))}
                        placeholder="9876543210"
                        className="w-full rounded-2xl border border-moss/25 bg-cream/40 py-3 pl-10 pr-4 text-sm text-forest placeholder:text-pebble focus:border-leaf focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-forest">Password</label>
                    <div className="relative">
                      <IconLock size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-pebble" />
                      <input
                        type="password"
                        required
                        value={signupData.password}
                        onChange={(e) => setSignupData((prev) => ({ ...prev, password: e.target.value }))}
                        placeholder="••••••••"
                        className="w-full rounded-2xl border border-moss/25 bg-cream/40 py-3 pl-10 pr-4 text-sm text-forest placeholder:text-pebble focus:border-leaf focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-forest">Confirm password</label>
                    <div className="relative">
                      <IconLock size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-pebble" />
                      <input
                        type="password"
                        required
                        value={signupData.confirmPassword}
                        onChange={(e) => setSignupData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                        placeholder="••••••••"
                        className="w-full rounded-2xl border border-moss/25 bg-cream/40 py-3 pl-10 pr-4 text-sm text-forest placeholder:text-pebble focus:border-leaf focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !isSignupReady}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-forest px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-forest/20 transition-all hover:bg-canopy disabled:cursor-not-allowed disabled:bg-stone/40"
                  >
                    {loading ? (
                      <>
                        <IconLoader2 size={16} className="animate-spin" /> Creating account...
                      </>
                    ) : (
                      'Create account'
                    )}
                  </button>

                  <div className="text-center text-sm text-stone">
                    Already have an account?{' '}
                    <button type="button" onClick={() => setMode('login')} className="font-semibold text-leaf hover:text-forest">
                      Sign in
                    </button>
                  </div>
                </form>
              )}
            </div>
          </FadeIn>
        </div>

      <Toaster position="top-right" richColors />
    </section>
  )
}

