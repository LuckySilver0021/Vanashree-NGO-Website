'use client'

import { useRef, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  IconCamera,
  IconLoader2,
  IconPackage,
  IconPhoto,
  IconX,
} from '@tabler/icons-react'
import { DONATION_CATEGORIES, DONATION_CONDITIONS, MAX_IMAGE_SIZE } from '@/lib/donations'
import { LocationPicker } from '@/components/donation/LocationPicker'

interface FormState {
  title: string
  description: string
  category: string
  condition: string
  location: string
  lat: number | null
  lng: number | null
}

const INITIAL_FORM: FormState = {
  title: '',
  description: '',
  category: '',
  condition: 'Gently Used',
  location: '',
  lat: null,
  lng: null,
}

export function PostListingForm() {
  const router = useRouter()
  const [form, setForm] = useState<FormState>(INITIAL_FORM)
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleImageChange = (file: File | null) => {
    if (!file) {
      setImage(null)
      setPreview(null)
      return
    }
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file')
      return
    }
    if (file.size > MAX_IMAGE_SIZE) {
      toast.error('Image must be smaller than 5MB')
      return
    }
    setImage(file)
    const reader = new FileReader()
    reader.onload = () => setPreview(String(reader.result))
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (submitting) return

    const title = form.title.trim()
    const description = form.description.trim()

    if (title.length < 4) {
      toast.error('Title must be at least 4 characters')
      return
    }
    if (!form.category) {
      toast.error('Please choose a category')
      return
    }
    if (!form.location.trim()) {
      toast.error('Please enter the location')
      return
    }

    setSubmitting(true)

    try {
      const body = new FormData()
      body.append('title', title)
      body.append('description', description)
      body.append('category', form.category)
      body.append('condition', form.condition)
      body.append('location', form.location.trim())
      if (form.lat != null && form.lng != null) {
        body.append('lat', String(form.lat))
        body.append('lng', String(form.lng))
      }

      const res = await fetch('/api/donations', { method: 'POST', body })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Could not post your donation. Please try again.')
        return
      }

      const listingId = data.listing?.id ?? null
      if (listingId && image) {
        const imageBody = new FormData()
        imageBody.append('image', image)
        void fetch(`/api/donations/${listingId}/image`, { method: 'POST', body: imageBody }).catch(
          () => undefined
        )
      }

      toast.success('Your donation is live!')
      router.replace(listingId ? `/donation/${listingId}` : '/donation', { scroll: false })
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-[32px] border border-moss/20 bg-white/85 p-6 shadow-[0_35px_100px_-35px_rgba(28,59,15,0.35)] backdrop-blur-xl sm:p-8"
    >
        {/* Image upload */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-forest">Photo</label>
          <div className="flex flex-col gap-4 sm:flex-row">
            {preview ? (
              <div className="relative h-44 w-full overflow-hidden rounded-2xl border border-moss/20 sm:w-64">
                <img src={preview} alt="Listing preview" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setImage(null)
                    setPreview(null)
                    if (fileInputRef.current) fileInputRef.current.value = ''
                  }}
                  aria-label="Remove photo"
                  className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
                >
                  <IconX size={14} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-44 w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-moss/40 bg-cream/50 text-pebble transition-colors hover:border-leaf/50 hover:bg-cream sm:w-64"
              >
                <IconPhoto size={24} className="text-leaf" />
                <span className="text-xs font-semibold">Add a photo</span>
                <span className="text-[10px] text-pebble/70">up to 5MB</span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageChange(e.target.files?.[0] ?? null)}
            />
          </div>
        </div>

        {/* Title */}
        <div>
          <label htmlFor="listing-title" className="mb-2 block text-sm font-semibold text-forest">
            Title
          </label>
          <input
            id="listing-title"
            type="text"
            required
            maxLength={100}
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="e.g. Wooden study table with drawers"
            className="w-full rounded-2xl border border-moss/25 bg-cream/40 py-3 px-4 text-sm text-forest placeholder:text-pebble focus:border-leaf focus:outline-none"
          />
          <p className="mt-1 text-right text-[10px] text-pebble/70">{form.title.length}/100</p>
        </div>

        {/* Category + condition */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-forest">Category</label>
            <div className="flex flex-wrap gap-1.5">
              {DONATION_CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => set('category', form.category === c ? '' : c)}
                  className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition-all ${
                    form.category === c
                      ? 'bg-forest text-white shadow-sm shadow-forest/20'
                      : 'border border-moss/25 bg-white/70 text-pebble hover:border-leaf/40 hover:text-forest'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-forest">Condition</label>
            <div className="flex flex-wrap gap-1.5">
              {DONATION_CONDITIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => set('condition', c)}
                  className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition-all ${
                    form.condition === c
                      ? 'bg-leaf text-white shadow-sm shadow-leaf/20'
                      : 'border border-moss/25 bg-white/70 text-pebble hover:border-leaf/40 hover:text-forest'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Location */}
        <div>
          <label htmlFor="listing-location" className="mb-2 block text-sm font-semibold text-forest">
            Location
          </label>
          <LocationPicker
            value={form.location}
            onChange={(location, lat, lng) => {
              set('location', location)
              set('lat', lat)
              set('lng', lng)
            }}
            placeholder="Search for a city..."
          />
          {form.location && form.lat == null && (
            <p className="mt-1.5 text-[11px] text-amber-700">
              Tip: pick a city from the suggestions so the map shows the exact area.
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="listing-description"
            className="mb-2 block text-sm font-semibold text-forest"
          >
            Description
          </label>
          <textarea
            id="listing-description"
            required
            rows={5}
            maxLength={2000}
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="Describe the item — age, condition, and why you're giving it away."
            className="w-full resize-none rounded-2xl border border-moss/25 bg-cream/40 py-3 px-4 text-sm text-forest placeholder:text-pebble focus:border-leaf focus:outline-none"
          />
          <p className="mt-1 text-right text-[10px] text-pebble/70">{form.description.length}/2000</p>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-forest px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-forest/25 transition-all hover:bg-canopy disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? (
            <>
              <IconLoader2 size={16} className="animate-spin" /> Posting your donation…
            </>
          ) : (
            <>
              <IconPackage size={16} /> Post donation
            </>
          )}
        </button>

        <p className="flex items-center justify-center gap-1.5 text-center text-[11px] text-pebble/70">
          <IconCamera size={12} className="shrink-0" />
          Listings are reviewed and visible to the whole Vanashree community.
        </p>
      </form>
  )
}
