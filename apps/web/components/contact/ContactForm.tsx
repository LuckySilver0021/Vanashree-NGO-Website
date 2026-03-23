'use client'

import { useState } from 'react'
import { IconSend, IconCheck } from '@tabler/icons-react'

interface ContactFormProps {
  toEmail: string
}

export function ContactForm({ toEmail }: ContactFormProps) {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const body = `Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`
    const mailtoLink = `mailto:${toEmail}?subject=${encodeURIComponent(form.subject)}&body=${encodeURIComponent(body)}`
    window.open(mailtoLink, '_blank')
    setSent(true)
    setTimeout(() => setSent(false), 4000)
  }

  const inputClass =
    'w-full rounded-xl border border-moss/20 bg-petal/50 px-4 py-3 text-sm text-forest placeholder:text-pebble focus:outline-none focus:border-leaf focus:ring-2 focus:ring-leaf/10 transition-all duration-200'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-forest mb-1.5 uppercase tracking-wide">Your Name</label>
          <input
            type="text"
            name="name"
            required
            placeholder="Ramesh Pawar"
            value={form.name}
            onChange={handleChange}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-forest mb-1.5 uppercase tracking-wide">Your Email</label>
          <input
            type="email"
            name="email"
            required
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-forest mb-1.5 uppercase tracking-wide">Subject</label>
        <select
          name="subject"
          required
          value={form.subject}
          onChange={handleChange}
          className={inputClass}
        >
          <option value="" disabled>Select a subject...</option>
          <option value="Volunteering Inquiry">I want to Volunteer</option>
          <option value="Partnership Inquiry">Partnership Opportunity</option>
          <option value="Donation Inquiry">Donation / Funding</option>
          <option value="General Inquiry">General Inquiry</option>
          <option value="Media / Press">Media / Press</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-forest mb-1.5 uppercase tracking-wide">Message</label>
        <textarea
          name="message"
          required
          rows={5}
          placeholder="Tell us how you'd like to connect or contribute..."
          value={form.message}
          onChange={handleChange}
          className={`${inputClass} resize-none`}
        />
      </div>

      <button
        type="submit"
        className="w-full flex items-center justify-center gap-2 bg-forest hover:bg-canopy text-white font-semibold text-sm py-3.5 px-6 rounded-xl transition-all duration-200 active:scale-[0.98]"
      >
        {sent ? (
          <>
            <IconCheck size={18} />
            Opening your email app…
          </>
        ) : (
          <>
            <IconSend size={18} />
            Send Message
          </>
        )}
      </button>

      <p className="text-xs text-pebble text-center leading-relaxed">
        This will open your email app with your message pre-filled.
      </p>
    </form>
  )
}
