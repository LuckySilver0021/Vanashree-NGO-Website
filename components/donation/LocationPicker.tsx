'use client'

import { useEffect, useRef, useState } from 'react'
import { IconLoader2, IconMapPin, IconSearch } from '@tabler/icons-react'

export interface LocationSuggestion {
  name: string
  region: string
  lat: number
  lng: number
}

interface LocationPickerProps {
  value: string
  onChange: (value: string, lat: number | null, lng: number | null) => void
  placeholder?: string
}

const MIN_QUERY_LENGTH = 2

export function LocationPicker({ value, onChange, placeholder }: LocationPickerProps) {
  const [query, setQuery] = useState(value)
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const trimmed = query.trim()
    if (trimmed.length < MIN_QUERY_LENGTH) {
      setSuggestions([])
      setOpen(false)
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)

    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/locations/suggest?q=${encodeURIComponent(trimmed)}`,
          { signal: controller.signal }
        )
        if (!res.ok) throw new Error('Failed')
        const data = (await res.json()) as { suggestions: LocationSuggestion[] }
        if (!cancelled) {
          setSuggestions(data.suggestions ?? [])
          setOpen(true)
        }
      } catch {
        if (!cancelled) {
          setSuggestions([])
          setOpen(false)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }, 300)

    return () => {
      cancelled = true
      controller.abort()
      window.clearTimeout(timer)
    }
  }, [query])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectSuggestion = (suggestion: LocationSuggestion) => {
    setQuery(suggestion.name)
    setOpen(false)
    setSuggestions([])
    onChange(suggestion.name, suggestion.lat, suggestion.lng)
  }

  const handleInputChange = (next: string) => {
    setQuery(next)
    setSuggestions([])
    setOpen(true)
    onChange(next, null, null)
  }

  return (
    <div ref={containerRef} className="relative">
      <IconMapPin
        size={15}
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-leaf"
      />
      <input
        type="text"
        required
        maxLength={60}
        value={query}
        onChange={(e) => handleInputChange(e.target.value)}
        placeholder={placeholder ?? 'Search for a city'}
        className="w-full rounded-2xl border border-moss/25 bg-cream/40 py-3 pl-9 pr-9 text-sm text-forest placeholder:text-pebble focus:border-leaf focus:outline-none"
      />
      <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-pebble/60">
        <IconSearch size={15} />
      </div>

      {loading && (
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-pebble/60">
          <IconLoader2 size={14} className="animate-spin" />
        </div>
      )}

      {open && query.trim().length >= MIN_QUERY_LENGTH && (
        <>
          {suggestions.length > 0 && (
            <ul className="absolute z-20 mt-2 max-h-64 w-full overflow-y-auto rounded-2xl border border-moss/20 bg-white p-1.5 shadow-xl">
              {suggestions.map((suggestion) => (
                <li key={`${suggestion.lat}-${suggestion.lng}-${suggestion.name}`}>
                  <button
                    type="button"
                    onClick={() => selectSuggestion(suggestion)}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm text-forest transition-colors hover:bg-leaf/10"
                  >
                    <IconMapPin size={14} className="shrink-0 text-leaf" />
                    <span className="min-w-0">
                      <span className="block truncate">{suggestion.name}</span>
                      {suggestion.region && (
                        <span className="block truncate text-[11px] text-pebble">
                          {suggestion.region}
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {!loading && suggestions.length === 0 && (
            <div className="absolute z-20 mt-2 w-full rounded-2xl border border-moss/20 bg-white px-4 py-3 text-xs text-pebble shadow-xl">
              No cities found. Keep typing or use a nearby city name.
            </div>
          )}
        </>
      )}
    </div>
  )
}