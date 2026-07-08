export function normalizeEmail(value: string) {
  return value.trim().toLowerCase()
}

export function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, '').trim()
  const withoutCountryCode = digits.startsWith('91') ? digits.slice(2) : digits
  return withoutCountryCode.length === 10 ? `+91${withoutCountryCode}` : withoutCountryCode
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

export function isValidPhone(value: string) {
  const digits = value.replace(/\D/g, '').trim()
  const withoutCountryCode = digits.startsWith('91') ? digits.slice(2) : digits
  return withoutCountryCode.length === 10
}

export function sanitizeName(value: string) {
  return value.trim().replace(/\s+/g, ' ')
}

export function setGuestModeCookie() {
  if (typeof document === 'undefined') return
  document.cookie = 'vanashree-guest=true; path=/; max-age=604800; SameSite=Lax'
}

export function clearGuestModeCookie() {
  if (typeof document === 'undefined') return
  document.cookie = 'vanashree-guest=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax'
}

export function hasGuestModeCookie() {
  if (typeof document === 'undefined') return false
  return document.cookie.split(';').some((entry) => entry.trim().startsWith('vanashree-guest='))
}

