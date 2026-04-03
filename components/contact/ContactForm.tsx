'use client'

import { useState } from 'react'
import { IconSend, IconCheck, IconAlertCircle } from '@tabler/icons-react'
import dynamic from 'next/dynamic'

const HCaptcha = dynamic(() => import('@hcaptcha/react-hcaptcha'), {
  ssr: false,
  loading: () => <div className="h-[78px] flex items-center justify-center text-xs text-pebble">Loading captcha…</div>,
})

interface ContactFormProps {
  toEmail: string
}

export function ContactForm({ toEmail }: ContactFormProps) {
  const [form, setForm] = useState({
    name: '', email: '', subject: '', message: '',
    location: '', skills: '', experience: '', education: '',
    phone: '', preferredRole: '',
  })

  const isVolunteer = form.subject === 'Volunteering Inquiry'
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  // hCaptcha state
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [captchaKey, setCaptchaKey] = useState(0)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm(prev => {
      const updated = { ...prev, [name]: value }
      // Clear volunteer fields when switching away from volunteering
      if (name === 'subject' && value !== 'Volunteering Inquiry') {
        updated.location = ''
        updated.skills = ''
        updated.experience = ''
        updated.education = ''
        updated.phone = ''
        updated.preferredRole = ''
      }
      return updated
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!captchaToken) {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 5000)
      return
    }

    setStatus('sending')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          subject: form.subject,
          message: form.message,
          'h-captcha-response': captchaToken,
          website: '', // honeypot — must be empty
          ...(isVolunteer && {
            location: form.location,
            skills: form.skills,
            experience: form.experience,
            education: form.education,
            phone: form.phone,
            preferredRole: form.preferredRole,
          }),
        }),
      })

      const data = await response.json()

      if (data.success) {
        setStatus('sent')
        setForm({ name: '', email: '', subject: '', message: '', location: '', skills: '', experience: '', education: '', phone: '', preferredRole: '' })
        setCaptchaToken(null)
        setCaptchaKey(k => k + 1)
        setTimeout(() => setStatus('idle'), 5000)
      } else {
        setStatus('error')
        setTimeout(() => setStatus('idle'), 5000)
      }
    } catch {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 5000)
    }
  }

  const inputClass =
    'w-full rounded-xl border border-moss/20 bg-petal/50 px-4 py-3 text-sm text-forest placeholder:text-pebble focus:outline-none focus:border-leaf focus:ring-2 focus:ring-leaf/10 transition-all duration-200'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Honeypot field — hidden from humans, bots will fill it */}
      <input
        type="text"
        name="website"
        value=""
        onChange={() => {}}
        tabIndex={-1}
        autoComplete="off"
        style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0, width: 0 }}
        aria-hidden="true"
      />

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

      {/* Volunteer-specific fields */}
      {isVolunteer && (
        <div className="space-y-4 rounded-xl border border-leaf/20 bg-leaf/5 p-4 animate-in">
          <p className="text-xs font-semibold text-leaf uppercase tracking-wide flex items-center gap-1.5">
            <span>🌿</span> Volunteer Details
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-forest mb-1.5 uppercase tracking-wide">Location</label>
              <input
                type="text"
                name="location"
                required
                placeholder="City, State"
                value={form.location}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-forest mb-1.5 uppercase tracking-wide">Education</label>
              <input
                type="text"
                name="education"
                required
                placeholder="B.A. in Social Work"
                value={form.education}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-forest mb-1.5 uppercase tracking-wide">Phone Number</label>
              <input
                type="tel"
                name="phone"
                required
                placeholder="+91 XXXXX XXXXX"
                value={form.phone}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-forest mb-1.5 uppercase tracking-wide">Preferred Role</label>
              <select
                name="preferredRole"
                required
                value={form.preferredRole}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="" disabled>Select a role...</option>
                <option value="Technical">Technical</option>
                <option value="Non-technical">Non-technical</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-forest mb-1.5 uppercase tracking-wide">Skills</label>
            <input
              type="text"
              name="skills"
              required
              placeholder="Teaching, First Aid, Event Management"
              value={form.skills}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-forest mb-1.5 uppercase tracking-wide">Experience</label>
            <textarea
              name="experience"
              required
              rows={3}
              placeholder="Tell us about any prior volunteering or relevant experience..."
              value={form.experience}
              onChange={handleChange}
              className={`${inputClass} resize-none`}
            />
          </div>
        </div>
      )}

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

      {/* hCaptcha widget */}
      <div className="flex justify-center">
        <HCaptcha
          key={captchaKey}
          sitekey="50b2fe65-b00b-4b9e-ad62-3ba471098be2"
          onVerify={(token: string) => setCaptchaToken(token)}
          onExpire={() => setCaptchaToken(null)}
        />
      </div>

      <button
        type="submit"
        disabled={status === 'sending' || !captchaToken}
        className="w-full flex items-center justify-center gap-2 bg-forest hover:bg-canopy text-white font-semibold text-sm py-3.5 px-6 rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === 'sending' ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Sending…
          </>
        ) : status === 'sent' ? (
          <>
            <IconCheck size={18} />
            Message Sent!
          </>
        ) : status === 'error' ? (
          <>
            <IconAlertCircle size={18} />
            Failed — Try Again
          </>
        ) : (
          <>
            <IconSend size={18} />
            Send Message
          </>
        )}
      </button>

      {status === 'sent' && (
        <p className="text-xs text-leaf text-center leading-relaxed font-medium">
          ✓ Your message has been sent successfully. We&apos;ll get back to you soon!
        </p>
      )}
      {status === 'error' && (
        <p className="text-xs text-red-500 text-center leading-relaxed font-medium">
          Something went wrong. Please try again or email us directly.
        </p>
      )}
      {status === 'idle' && !captchaToken && (
        <p className="text-xs text-pebble text-center leading-relaxed">
          Please complete the captcha above to send your message.
        </p>
      )}
      {status === 'idle' && captchaToken && (
        <p className="text-xs text-pebble text-center leading-relaxed">
          Your message will be sent directly to our team.
        </p>
      )}
    </form>
  )
}
