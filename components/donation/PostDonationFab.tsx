'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { IconPlus } from '@tabler/icons-react'

export function PostDonationFab() {
  const pathname = usePathname()

  if (pathname === '/donation/new') return null

  return (
    <Link
      href="/donation/new"
      aria-label="Post a new donation"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gold text-forest shadow-xl shadow-gold/30 transition-all hover:scale-105 hover:bg-amber active:scale-95"
    >
      <IconPlus size={24} stroke={2} />
    </Link>
  )
}
