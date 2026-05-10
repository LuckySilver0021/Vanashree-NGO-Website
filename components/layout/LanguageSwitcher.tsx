'use client'

import { useRouter } from 'next/navigation'
import { useTransition, useState } from 'react'
import { useLocale } from 'next-intl'
import { IconLanguage, IconCheck } from '@tabler/icons-react'

const locales = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'hi', label: 'हि', name: 'हिन्दी' },
  { code: 'mr', label: 'म', name: 'मराठी' },
] as const

export function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [open, setOpen] = useState(false)

  function switchLocale(newLocale: string) {
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=${60 * 60 * 24 * 365}`
    startTransition(() => {
      router.refresh()
    })
    setOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-white/60 hover:text-white text-sm transition-colors px-2 py-1.5 rounded-lg hover:bg-white/5"
        aria-label="Change language"
      >
        <IconLanguage size={16} />
        <span className="text-xs font-medium uppercase">
          {locales.find((l) => l.code === locale)?.label || 'EN'}
        </span>
      </button>

      {open && (
        <>
          {/* Backdrop to close */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 bg-forest/95 backdrop-blur-xl rounded-xl border border-white/10 shadow-xl z-50 min-w-[140px] py-1.5 overflow-hidden">
            {locales.map((l) => (
              <button
                key={l.code}
                onClick={() => switchLocale(l.code)}
                className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between gap-3 transition-colors ${
                  locale === l.code
                    ? 'text-gold bg-white/5'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{l.name}</span>
                {locale === l.code && <IconCheck size={14} className="text-gold" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
