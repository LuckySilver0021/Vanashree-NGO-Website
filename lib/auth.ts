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

export type AppIntent = 'sapling' | 'donation'

export const INTENT_COOKIE = 'vanashree-intent'

export function setAppIntentCookie(intent: AppIntent) {
  if (typeof document === 'undefined') return
  document.cookie = `${INTENT_COOKIE}=${intent}; path=/; max-age=604800; SameSite=Lax`
}

export function getAppIntentCookie(): AppIntent | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie
    .split(';')
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(`${INTENT_COOKIE}=`))
  const value = match?.split('=')[1]
  return value === 'sapling' || value === 'donation' ? value : null
}

