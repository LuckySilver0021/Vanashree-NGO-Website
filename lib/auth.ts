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

