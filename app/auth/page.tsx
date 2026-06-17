'use client'

import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { IconLeaf, IconArrowLeft, IconAlertCircle } from '@tabler/icons-react'
import Link from 'next/link'
import { FadeIn } from '@/components/motion/FadeIn'

type AuthMode = 'login' | 'signup'

export default function AuthPage() {
  const router = useRouter()
  const [mode, setMode] = useState<AuthMode>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Login form
  const [loginData, setLoginData] = useState({ email: '', password: '' })

  // Signup form
  const [signupData, setSignupData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email: loginData.email,
        password: loginData.password,
        redirect: false,
      })

      if (result?.error) {
        setError(result.error)
      } else if (result?.ok) {
        setSuccessMessage('Login successful! Redirecting...')
        setTimeout(() => router.replace('/maps?loggedIn=true'), 1500)
      }
    } catch (err) {
      setError('An error occurred during login')
    } finally {
      setLoading(false)
    }
  }

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupData),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Signup failed')
        return
      }

      setSuccessMessage('Account created! Signing you in...')
      setSignupData({ fullName: '', email: '', phone: '', password: '', confirmPassword: '' })

      // Auto-login
      setTimeout(async () => {
        const loginResult = await signIn('credentials', {
          email: signupData.email,
          password: signupData.password,
          redirect: false,
        })

        if (loginResult?.ok) {
          router.replace('/maps?loggedIn=true')
        }
      }, 1000)
    } catch (err) {
      setError('An error occurred during signup')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="min-h-screen flex items-center justify-center bg-cream pt-16 pb-8 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-leaf/5 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-gold/8 blur-3xl" />

      <div className="max-w-md w-full mx-auto px-4 relative z-10">
        <FadeIn>
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-forest to-leaf flex items-center justify-center mx-auto mb-4 shadow-lg shadow-forest/20 overflow-hidden">
              <img src="/images/logo/logo.png" alt="Vanashree" className="w-10 h-10 object-contain" />
            </div>
            <h1 className="text-3xl font-bold text-forest">
              {mode === 'login' ? 'Welcome Back' : 'Join Vanashree'}
            </h1>
            <p className="text-stone mt-2 text-sm">
              {mode === 'login' ? 'Continue your journey' : 'Create an account'}
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="bg-white rounded-2xl p-8 shadow-xl shadow-forest/5 border border-moss/15">
            {/* Messages */}
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 flex gap-2">
                <IconAlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
                <p className="text-red-600 text-xs">{error}</p>
              </div>
            )}

            {successMessage && (
              <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200">
                <p className="text-green-600 text-xs text-center font-medium">{successMessage}</p>
              </div>
            )}

            {/* LOGIN FORM */}
            {mode === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-forest mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    placeholder="your@email.com"
                    className="w-full px-4 py-2.5 rounded-lg border border-moss/20 focus:border-leaf focus:outline-none transition-colors bg-cream/30 text-forest placeholder:text-pebble"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-forest mb-1.5">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 rounded-lg border border-moss/20 focus:border-leaf focus:outline-none transition-colors bg-cream/30 text-forest placeholder:text-pebble"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-forest hover:bg-canopy disabled:bg-stone/40 text-white text-sm font-bold px-4 py-3 rounded-xl transition-all duration-300 shadow-md shadow-forest/20 hover:shadow-lg hover:shadow-forest/25"
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-moss/20" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-white px-3 text-pebble">New to Vanashree?</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setMode('signup')
                    setError('')
                    setSuccessMessage('')
                  }}
                  className="w-full border-2 border-leaf hover:border-forest bg-white hover:bg-cream/50 text-forest text-sm font-bold px-4 py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <IconLeaf size={16} />
                  Create Account
                </button>
              </form>
            ) : (
              /* SIGNUP FORM */
              <form onSubmit={handleSignupSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-forest mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={signupData.fullName}
                    onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                    placeholder="John Doe"
                    className="w-full px-4 py-2.5 rounded-lg border border-moss/20 focus:border-leaf focus:outline-none transition-colors bg-cream/30 text-forest placeholder:text-pebble"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-forest mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={signupData.email}
                    onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                    placeholder="your@email.com"
                    className="w-full px-4 py-2.5 rounded-lg border border-moss/20 focus:border-leaf focus:outline-none transition-colors bg-cream/30 text-forest placeholder:text-pebble"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-forest mb-1.5">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={signupData.phone}
                    onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                    placeholder="+91 XXXXX XXXXX"
                    className="w-full px-4 py-2.5 rounded-lg border border-moss/20 focus:border-leaf focus:outline-none transition-colors bg-cream/30 text-forest placeholder:text-pebble"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-forest mb-1.5">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={signupData.password}
                    onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 rounded-lg border border-moss/20 focus:border-leaf focus:outline-none transition-colors bg-cream/30 text-forest placeholder:text-pebble"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-forest mb-1.5">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    required
                    value={signupData.confirmPassword}
                    onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 rounded-lg border border-moss/20 focus:border-leaf focus:outline-none transition-colors bg-cream/30 text-forest placeholder:text-pebble"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-leaf hover:bg-fern disabled:bg-stone/40 text-white text-sm font-bold px-4 py-3 rounded-xl transition-all duration-300 shadow-md shadow-leaf/20 hover:shadow-lg hover:shadow-leaf/25 flex items-center justify-center gap-2"
                >
                  <IconLeaf size={16} />
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode('login')
                    setError('')
                    setSuccessMessage('')
                  }}
                  className="w-full text-forest hover:text-forest/70 text-xs font-medium py-2"
                >
                  Already have an account? Sign In
                </button>
              </form>
            )}

            {/* Back button */}
            <button
              type="button"
              onClick={() => router.push('/')}
              className="w-full flex items-center justify-center gap-1.5 text-xs text-pebble hover:text-forest transition-colors pt-4 mt-4 border-t border-moss/10"
            >
              <IconArrowLeft size={14} />
              Back to home
            </button>
          </div>
        </FadeIn>

        <p className="text-center text-xs text-pebble mt-6">
          By continuing, you agree to our{' '}
          <Link href="/" className="text-leaf underline hover:text-forest transition-colors">
            Terms
          </Link>{' '}
          and{' '}
          <Link href="/" className="text-leaf underline hover:text-forest transition-colors">
            Privacy Policy
          </Link>
        </p>
      </div>
    </section>
  )
}
