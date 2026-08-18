'use client'

import { FormEvent, useEffect, useRef, useState, Suspense, useSyncExternalStore } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  IconAlertCircle,
  IconCheck,
  IconGift,
  IconLeaf,
  IconLoader2,
  IconLock,
  IconMail,
  IconPhone,
  IconSparkles,
  IconUser,
} from '@tabler/icons-react'
import { toast, Toaster } from 'sonner'
import { FadeIn } from '@/components/motion/FadeIn'
import {
  clearGuestModeCookie,
  getAppIntentCookie,
  isValidEmail,
  isValidPhone,
  normalizeEmail,
  normalizePhone,
  sanitizeName,
  setAppIntentCookie,
  setGuestModeCookie,
  type AppIntent,
} from '@/lib/auth'
import { requestLocationNow } from '@/lib/useFreshLocation'

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

function looksLikeCompleteEmail(email: string) {
  const trimmed = email.trim()
  if (!trimmed || trimmed.includes(' ') || trimmed.startsWith('@') || trimmed.endsWith('@')) {
    return false
  }

  const atIndex = trimmed.indexOf('@')
  const dotIndex = trimmed.lastIndexOf('.')
  const domain = trimmed.slice(atIndex + 1)

  return atIndex > 0 && domain.length > 0 && dotIndex > atIndex + 1 && dotIndex < trimmed.length - 1
}

export default function AuthPage() {
  return (
    <Suspense fallback={null}>
      <AuthPageInner />
    </Suspense>
  )
}

function AuthPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
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

  const urlIntent = searchParams.get('intent')
  const validUrlIntent: AppIntent | null =
    urlIntent === 'donation' || urlIntent === 'sapling' ? urlIntent : null

  // Hydration-safe read of the persisted intent cookie (server snapshot is null)
  const cookieIntent = useSyncExternalStore(
    () => () => {},
    () => getAppIntentCookie(),
    () => null
  )

  const [userChoice, setUserChoice] = useState<AppIntent | null>(null)
  const intent: AppIntent = userChoice ?? validUrlIntent ?? cookieIntent ?? 'sapling'

  const handleIntentChange = (next: AppIntent) => {
    setUserChoice(next)
    setAppIntentCookie(next)
    setError('')
    setSuccessMessage('')
  }

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

    if (!looksLikeCompleteEmail(email)) {
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

  const handleGuestContinue = async () => {
    setError('')
    setLoading(true)

    try {
      clearGuestModeCookie()
      setGuestModeCookie()
      setAppIntentCookie(intent)
      
      if (intent === 'sapling') {
        void requestLocationNow()
      }
      setSuccessMessage(
        intent === 'donation'
          ? 'Continuing to the donation marketplace as guest...'
          : 'Continuing as guest...'
      )
      setTimeout(() => router.replace(intent === 'donation' ? '/donation' : '/maps'), 600)
    } catch {
      setError('Unable to continue as guest right now.')
    } finally {
      setLoading(false)
    }
  }

  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const email = normalizeEmail(loginData.email)
      const password = loginData.password

      clearGuestModeCookie()

      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError(result.error)
      } else if (result?.ok) {
        setAppIntentCookie(intent)
        if (intent === 'sapling') {
          void requestLocationNow()
        }
        setSuccessMessage(
          intent === 'donation' ? 'Login successful! Taking you to the marketplace...' : 'Login successful!'
        )
        setTimeout(
          () =>
            intent === 'donation'
              ? router.replace('/donation')
              : router.replace('/maps'),
          800
        )
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

      if (intent === 'sapling') {
        void requestLocationNow()
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

      clearGuestModeCookie()
      setAppIntentCookie(intent)

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
          if (intent === 'donation') {
            router.replace('/donation')
          } else {
            router.replace('/maps')
          }
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
    <section className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(168,197,122,0.3),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(200,160,81,0.16),transparent_26%),linear-gradient(135deg,#f8f7f0_0%,#eef3e4_50%,#f7efe0_100%)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(28,59,15,0.06),transparent_24%,rgba(200,160,81,0.08))]" />
      <div className="absolute -left-8 -top-8 h-72 w-72 rounded-full bg-leaf/15 blur-3xl" />
      <div className="absolute -bottom-8 -right-8 h-72 w-72 rounded-full bg-gold/15 blur-3xl" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.7),transparent_56%)]" />

      <div className="relative mx-auto flex min-h-screen max-w-2xl items-center justify-center">
        <FadeIn direction="right" className="w-full">
          <div className="relative overflow-hidden rounded-[32px] border border-white/80 bg-white/85 p-6 shadow-[0_35px_100px_-35px_rgba(28,59,15,0.42)] ring-1 ring-black/5 backdrop-blur-2xl sm:p-8">
            <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(255,255,255,0.95),rgba(255,255,255,0.68))]" />
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full border border-forest/10" />
            <div className="absolute -bottom-12 -left-8 h-36 w-36 rounded-full border border-gold/20" />
            <div className="relative">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-stone-200/70 bg-stone-50/80 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-pebble">Welcome</p>
                  <h2 className="mt-1 text-2xl font-semibold text-forest">
                    {mode === 'login' ? 'Sign in' : 'Create account'}
                  </h2>
                </div>
                <div className="flex rounded-full bg-white/80 p-1 shadow-[0_8px_24px_-16px_rgba(28,59,15,0.35)] ring-1 ring-black/5">
                  {(['login', 'signup'] as AuthMode[]).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        setMode(option)
                        setError('')
                        setSuccessMessage('')
                      }}
                      className={`rounded-full px-3 py-2 text-sm font-medium transition-all ${mode === option ? 'bg-forest text-white shadow-sm shadow-forest/20' : 'text-stone hover:bg-stone-100 hover:text-forest'}`}
                    >
                      {option === 'login' ? 'Sign in' : 'Create account'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Where do you want to continue? */}
              <div className="mb-6">
                <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-pebble">
                  Continue to
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleIntentChange('sapling')}
                    aria-pressed={intent === 'sapling'}
                    className={`group rounded-[20px] border p-3.5 text-left transition-all ${
                      intent === 'sapling'
                        ? 'border-leaf/50 bg-leaf/10 shadow-[0_10px_24px_-16px_rgba(28,59,15,0.45)] ring-1 ring-leaf/30'
                        : 'border-stone-200/70 bg-white/60 hover:border-leaf/30 hover:bg-cream/40'
                    }`}
                  >
                    <span
                      className={`mb-2 flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${
                        intent === 'sapling' ? 'bg-forest text-white' : 'bg-leaf/15 text-leaf'
                      }`}
                    >
                      <IconLeaf size={17} />
                    </span>
                    <span className="block text-sm font-bold text-forest">Sapling Map</span>
                    <span className="mt-0.5 block text-[11px] leading-snug text-pebble">
                      Mark trees &amp; grow a plantation
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleIntentChange('donation')}
                    aria-pressed={intent === 'donation'}
                    className={`group rounded-[20px] border p-3.5 text-left transition-all ${
                      intent === 'donation'
                        ? 'border-gold/50 bg-gold/10 shadow-[0_10px_24px_-16px_rgba(200,160,81,0.45)] ring-1 ring-gold/30'
                        : 'border-stone-200/70 bg-white/60 hover:border-gold/30 hover:bg-sand/40'
                    }`}
                  >
                    <span
                      className={`mb-2 flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${
                        intent === 'donation' ? 'bg-gold text-forest' : 'bg-gold/15 text-gold'
                      }`}
                    >
                      <IconGift size={17} />
                    </span>
                    <span className="block text-sm font-bold text-forest">Vanashree Donation</span>
                    <span className="mt-0.5 block text-[11px] leading-snug text-pebble">
                      Give &amp; receive pre-loved items
                    </span>
                  </button>
                </div>
                <p className="mt-2.5 text-[11px] leading-relaxed text-pebble/80">
                  One account (or guest session) works across the entire Vanashree ecosystem.
                </p>
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

              <div className="mt-6 border-t border-stone-200/70 pt-5">
                <div className="mb-3 flex items-center gap-3">
                  <div className="h-px flex-1 bg-stone-200" />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-pebble">or</span>
                  <div className="h-px flex-1 bg-stone-200" />
                </div>
                <button
                  type="button"
                  onClick={handleGuestContinue}
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-leaf/30 bg-cream/80 px-4 py-3 text-sm font-semibold text-forest shadow-[0_10px_24px_-16px_rgba(28,59,15,0.35)] transition-all hover:bg-cream hover:shadow-[0_12px_28px_-14px_rgba(28,59,15,0.4)] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <IconSparkles size={16} />
                  {intent === 'donation' ? 'Continue to marketplace as guest' : 'Continue as guest'}
                </button>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>

      <Toaster position="top-right" richColors />
    </section>
  )
}
