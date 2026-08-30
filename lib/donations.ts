export const DONATION_CATEGORIES = [
  'Books & Study Material',
  'Clothing',
  'Electronics',
  'Furniture',
  'Kitchen & Utensils',
  'Toys',
  'Farm & Garden',
  'Medical Equipment',
  'Sports',
  'Other',
] as const

export type DonationCategory = (typeof DONATION_CATEGORIES)[number]

export const DONATION_CONDITIONS = ['New', 'Like New', 'Gently Used', 'Used', 'Needs Repair'] as const

export const DONATION_STATUSES = ['available', 'reserved', 'donated'] as const
export type DonationStatus = (typeof DONATION_STATUSES)[number]

export const DONATION_LOCATIONS = [
  'Ahilyanagar',
  'Parner',
  'Gatewadi',
  'Pune',
  'Nashik',
  'Mumbai',
  'Aurangabad',
  'Ahmednagar',
  'Shirdi',
] as const

export const LISTING_TAKE = 12
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024

export const STATUS_LABELS: Record<DonationStatus, string> = {
  available: 'Available',
  reserved: 'Reserved',
  donated: 'Donated',
}

export function timeAgo(dateValue: string | Date) {
  const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (Number.isNaN(seconds) || seconds < 0) return 'Just now'

  const intervals: Array<[number, string]> = [
    [31536000, 'year'],
    [2592000, 'month'],
    [604800, 'week'],
    [86400, 'day'],
    [3600, 'hour'],
    [60, 'minute'],
  ]

  for (const [secondsIn, label] of intervals) {
    const value = Math.floor(seconds / secondsIn)
    if (value >= 1) return `${value} ${label}${value > 1 ? 's' : ''} ago`
  }

  return 'Just now'
}

export function categoryIcon(category: string) {
  switch (category) {
    case 'Books & Study Material':
      return 'book'
    case 'Clothing':
      return 'shirt'
    case 'Electronics':
      return 'device'
    case 'Furniture':
      return 'armchair'
    case 'Kitchen & Utensils':
      return 'cooking'
    case 'Toys':
      return 'toy'
    case 'Farm & Garden':
      return 'leaf'
    case 'Medical Equipment':
      return 'first-aid'
    case 'Sports':
      return 'ball'
    default:
      return 'package'
  }
}

export interface ListingDTO {
  id: string
  title: string
  description: string
  category: string
  condition: string
  location: string
  lat: number | null
  lng: number | null
  imageUrl: string | null
  status: DonationStatus
  createdAt: string
  updatedAt: string
  seller: { id: string; fullName: string; phone?: string | null }
  favouriteCount: number
  favouritedByMe: boolean
}

export interface QueryListingsResult {
  listings: ListingDTO[]
  page: number
  total: number
  totalPages: number
  hasMore: boolean
  /** True when the result contains the full matching dataset (catalog mode). */
  exhaustive?: boolean
}
