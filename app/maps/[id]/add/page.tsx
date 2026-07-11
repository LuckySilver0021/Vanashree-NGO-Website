'use client'

import { useRouter, useParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { IconArrowLeft, IconPlus, IconPhoto } from '@tabler/icons-react'
import { hasGuestModeCookie } from '@/lib/auth'

export default function AddTimelineEntryPage() {
  const router = useRouter()
  const params = useParams() as { id?: string }
  const markerId = params?.id

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [image, setImage] = useState<File | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!markerId) {
      router.replace('/maps')
      return
    }

    if (hasGuestModeCookie()) {
      router.replace(`/maps/${markerId}`)
    }
  }, [markerId, router])

  const isFormValid = useMemo(() => {
    return title.trim().length >= 3 && description.trim().length >= 10 && !!date
  }, [title, description, date])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!markerId) {
      setError('Invalid sapling reference.')
      return
    }

    if (hasGuestModeCookie()) {
      setError('Guest users can only view sapling updates.')
      router.replace(`/maps/${markerId}`)
      return
    }

    if (!isFormValid) {
      setError('Please provide a title, description and a valid date.')
      return
    }

    setIsSaving(true)

    try {
      const formData = new FormData()
      formData.append('markerId', markerId)
      formData.append('title', title.trim())
      formData.append('description', description.trim())
      formData.append('date', date)
      if (image) {
        formData.append('image', image)
      }

      const res = await fetch('/api/timeline', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Could not save timeline entry.')
        return
      }

      setSuccess('Timeline update saved successfully.')
      setTitle('')
      setDescription('')
      setImage(null)
      router.replace(`/maps?selected=${encodeURIComponent(markerId)}`)
    } catch (err) {
      console.error('Failed to save timeline entry', err)
      setError('Could not save timeline entry. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(168,197,122,0.18),transparent_34%),linear-gradient(135deg,#f7f8f2_0%,#eef2e6_50%,#f9f4e8_100%)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl rounded-[32px] border border-white/80 bg-white/90 p-6 shadow-[0_35px_85px_-35px_rgba(28,59,15,0.32)] backdrop-blur-2xl sm:p-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="mt-2 text-3xl font-semibold text-forest">Add timeline update</h1>
          </div>
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 rounded-full border border-forest/20 bg-white px-4 py-2 text-sm font-semibold text-forest transition hover:bg-forest/5"
          >
            <IconArrowLeft size={16} /> Back
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-semibold text-forest">Title</label>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Healthy new growth"
              className="w-full rounded-[20px] border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-forest outline-none transition focus:border-leaf focus:ring-2 focus:ring-leaf/20"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-forest">Description</label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={6}
              placeholder="Describe the current condition, progress, or care taken for the sapling."
              className="w-full rounded-[20px] border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-forest outline-none transition focus:border-leaf focus:ring-2 focus:ring-leaf/20"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-forest">Date</label>
              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="w-full rounded-[20px] border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-forest outline-none transition focus:border-leaf focus:ring-2 focus:ring-leaf/20"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-forest">Image (optional)</label>
              <label className="flex cursor-pointer items-center justify-between rounded-[20px] border border-dashed border-stone-300 bg-white px-4 py-3 text-sm text-stone transition hover:border-leaf/50">
                <span>{image ? image.name : 'Upload image from device'}</span>
                <IconPhoto size={18} className="text-forest" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => setImage(event.target.files?.[0] ?? null)}
                />
              </label>
            </div>
          </div>

          {error && <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
          {success && <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</p>}

          <button
            type="submit"
            disabled={isSaving || !isFormValid}
            className="inline-flex w-full items-center justify-center gap-2 rounded-[20px] bg-forest px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-forest/20 transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-stone/40"
          >
            <IconPlus size={18} />
            {isSaving ? 'Saving...' : 'Save update'}
          </button>
        </form>
      </div>
    </main>
  )
}
