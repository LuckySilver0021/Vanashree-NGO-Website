'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { IconMenu2, IconX, IconArrowRight } from '@tabler/icons-react'
// import { LanguageSwitcher } from './LanguageSwitcher'
import { useTranslations } from 'next-intl'
import { useSession } from 'next-auth/react'

const NAV_HREFS = [
  { href: '/', key: 'home' },
  { href: '/about', key: 'about' },
  { href: '/programs', key: 'programs' },
  { href: '/gallery', key: 'gallery' },
  { href: '/blog', key: 'blog' },
  { href: '/contact', key: 'contact' },
  { href: '/donate', key: 'donate' },
] as const

export function Navbar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const t = useTranslations('nav')
  const { data: session } = useSession()

  // Hide navbar on the ecosystem apps (sapling map & donation marketplace)
  if (pathname.startsWith('/maps') || pathname.startsWith('/donation')) return null

  const isAuthenticated = !!session?.user

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-40 bg-forest/95 backdrop-blur-xl shadow-lg shadow-black/10 transition-all duration-500"
    >
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 text-white font-bold text-lg tracking-wide group"
          >
            <Image
              src="/images/logo/logo.png"
              alt="Vanashree Logo"
              width={36}
              height={36}
              className="rounded-full ring-2 ring-white/10 group-hover:ring-gold/30 transition-all duration-300"
              priority
            />
            <span className="hidden sm:inline">Vanashree</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-0.5">
            {NAV_HREFS.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-3.5 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                    isActive
                      ? 'text-white bg-white/12'
                      : 'text-white/65 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {t(link.key)}
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-gold rounded-full" />
                  )}
                </Link>
              )
            })}
            <div className="ml-4 pl-4 border-l border-white/10 flex items-center gap-2">
              {/* <LanguageSwitcher /> */}
              {isAuthenticated ? (
                <Link
                  href="/join"
                  className="bg-leaf hover:bg-fern text-white text-sm font-bold px-5 py-2 rounded-full transition-all duration-300 shadow-sm shadow-leaf/20 hover:scale-[1.02]"
                >
                  {t('joinNow')}
                </Link>
              ) : (
                <Link
                  href="/auth"
                  className="bg-leaf hover:bg-fern text-white text-sm font-bold px-5 py-2 rounded-full transition-all duration-300 shadow-sm shadow-leaf/20 hover:scale-[1.02]"
                >
                  {t('joinNow')}
                </Link>
              )}
              <Link
                href="/contact"
                className="bg-gold/90 hover:bg-gold text-forest text-sm font-bold px-5 py-2 rounded-full transition-all duration-300 shadow-sm shadow-gold/20 flex items-center gap-1.5 hover:scale-[1.02]"
              >
                {t('getInvolved')}
                <IconArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
            onClick={() => setOpen(!open)}
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <IconX size={22} /> : <IconMenu2 size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' as const }}
            className="md:hidden bg-forest/98 backdrop-blur-xl border-t border-white/5 overflow-hidden"
          >
            <div className="px-4 py-5 flex flex-col gap-1">
              {NAV_HREFS.map((link) => {
                const isActive = pathname === link.href
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={`px-4 py-2.5 rounded-xl text-base font-medium transition-colors ${
                      isActive
                        ? 'text-white bg-white/10'
                        : 'text-white/75 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {t(link.key)}
                  </Link>
                )
              })}
              <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
              {isAuthenticated ? (
                <Link
                  href="/join"
                  onClick={() => setOpen(false)}
                  className="bg-leaf text-white text-sm font-bold px-4 py-3 rounded-xl text-center hover:bg-fern transition-colors flex items-center justify-center gap-2"
                >
                  {t('joinNow')}
                </Link>
              ) : (
                <Link
                  href="/auth"
                  onClick={() => setOpen(false)}
                  className="bg-leaf text-white text-sm font-bold px-4 py-3 rounded-xl text-center hover:bg-fern transition-colors flex items-center justify-center gap-2"
                >
                  {t('joinNow')}
                </Link>
              )}
                <Link
                  href="/contact"
                  onClick={() => setOpen(false)}
                  className="bg-gold text-forest text-sm font-bold px-4 py-3 rounded-xl text-center hover:bg-amber transition-colors flex items-center justify-center gap-2"
                >
                  {t('getInvolved')}
                  <IconArrowRight size={16} />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
