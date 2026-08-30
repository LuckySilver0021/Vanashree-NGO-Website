import { prisma } from '@/lib/prisma'

export interface ProfileStats {
  fullName: string
  donatedCount: number
  saplingCount: number
}

export async function getProfileStats(userId: string): Promise<ProfileStats | null> {
  const [user, donatedCount, saplingCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { fullName: true },
    }),
    prisma.donationListing.count({
      where: { sellerId: userId, status: 'donated' },
    }),
    prisma.mapMarker.count({
      where: { userId },
    }),
  ])

  if (!user) return null

  return {
    fullName: user.fullName,
    donatedCount,
    saplingCount,
  }
}
