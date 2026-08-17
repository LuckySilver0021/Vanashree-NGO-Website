'use client'

import Link from 'next/link'
import { IconLeaf, IconGift, IconArrowRight, IconLogout } from '@tabler/icons-react'
import { signOut } from 'next-auth/react'
import { FadeIn } from '@/components/motion/FadeIn'
import { setAppIntentCookie, type AppIntent } from '@/lib/auth'
import type { Session } from 'next-auth'

function greetName(fullName?: string | null) {
  if (!fullName) return 'there'
  const first = fullName.trim().split(/\s+/)[0]
  return first || 'there'
}

const OPTIONS: {
  intent: AppIntent
  href: string
  icon: typeof IconLeaf
  title: string
  tagline: string
  accent: string
  iconBg: string
  hoverRing: string
  chip: string
}[] = [
  {
    intent: 'sapling',
    href: '/maps',
    icon: IconLeaf,
    title: 'Sapling Plantation',
    tagline: 'Mark trees on the map and grow a plantation — track every sapling you plant across Vanashree.',
    accent: 'border-leaf/50 bg-leaf/10',
    iconBg: 'bg-forest text-white',
    hoverRing: 'hover:border-leaf/30',
    chip: 'Plant a tree',
  },
  {
    intent: 'donation',
    href: '/donation',
    icon: IconGift,
    title: 'Donation Marketplace',
    tagline: 'Give & receive pre-loved items — post listings, browse the marketplace and share with your community.',
    accent: 'border-gold/50 bg-gold/10',
    iconBg: 'bg-gold text-forest',
    hoverRing: 'hover:border-gold/30',
    chip: 'Explore listings',
  },
]

export function JoinClient({ session }: { session: Session }) {
  const handleChoose = (intent: AppIntent) => {
    setAppIntentCookie(intent)
  }

  return (
    <section className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(168,197,122,0.3),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(200,160,81,0.16),transparent_26%),linear-gradient(135deg,#f8f7f0_0%,#eef3e4_50%,#f7efe0_100%)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(28,59,15,0.06),transparent_24%,rgba(200,160,81,0.08))]" />
      <div className="absolute -left-8 -top-8 h-72 w-72 rounded-full bg-leaf/15 blur-3xl" />
      <div className="absolute -bottom-8 -right-8 h-72 w-72 rounded-full bg-gold/15 blur-3xl" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.7),transparent_56%)]" />

      <div className="relative mx-auto flex min-h-screen max-w-3xl items-center justify-center">
        <FadeIn direction="right" className="w-full">
          <div className="relative overflow-hidden rounded-[32px] border border-white/80 bg-white/85 p-6 shadow-[0_35px_100px_-35px_rgba(28,59,15,0.42)] ring-1 ring-black/5 backdrop-blur-2xl sm:p-10">
            <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(255,255,255,0.95),rgba(255,255,255,0.68))]" />
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full border border-forest/10" />
            <div className="absolute -bottom-12 -left-8 h-36 w-36 rounded-full border border-gold/20" />
            <div className="relative">
              <div className="mb-8 rounded-[24px] border border-stone-200/70 bg-stone-50/80 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-pebble">
                  Welcome back
                </p>
                <h1 className="mt-1 text-3xl font-semibold text-forest">
                  Hey, {greetName(session.user.fullName)}! 👋
                </h1>
                <p className="mt-1.5 text-sm leading-relaxed text-pebble">
                  You&apos;re signed in as {session.user.email}. Where would you like to continue?
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {OPTIONS.map((option) => {
                  const Icon = option.icon
                  return (
                    <Link
                      key={option.intent}
                      href={option.href}
                      onClick={() => handleChoose(option.intent)}
                      className={`group relative flex flex-col rounded-[24px] border p-6 transition-all duration-300 hover:shadow-[0_18px_40px_-18px_rgba(28,59,15,0.5)] ${option.accent} ${option.hoverRing}`}
                    >
                      <span
                        className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-105 ${option.iconBg}`}
                      >
                        <Icon size={22} />
                      </span>
                      <span className="text-base font-bold text-forest">{option.title}</span>
                      <span className="mt-1.5 flex-1 text-[13px] leading-relaxed text-pebble">
                        {option.tagline}
                      </span>
                      <span className="mt-5 flex items-center justify-between">
                        <span className="rounded-full bg-white/70 px-3 py-1 text-[11px] font-bold text-forest ring-1 ring-black/5">
                          {option.chip}
                        </span>
                        <IconArrowRight
                          size={18}
                          className="text-pebble transition-all duration-300 group-hover:translate-x-1 group-hover:text-forest"
                        />
                      </span>
                    </Link>
                  )
                })}
              </div>

              <button
                type="button"
                onClick={() => signOut({ callbackUrl: '/' })}
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl border border-stone-200/80 bg-white/70 px-4 py-3 text-sm font-semibold text-pebble transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              >
                <IconLogout size={15} />
                Sign out
              </button>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
