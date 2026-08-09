import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { DonationHeader } from '@/components/donation/DonationHeader'
import { ListingDetail } from '@/components/donation/ListingDetail'
import { getSessionUserId, serializeListing } from '@/lib/donations.server'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const listing = await prisma.donationListing.findUnique({
    where: { id },
    select: { title: true, location: true, category: true },
  })

  if (!listing) return { title: 'Listing Not Found' }

  return {
    title: listing.title,
    description: `Donated ${listing.category} in ${listing.location} — find it on Vanashree Daan.`,
  }
}

export default async function DonationListingDetailPage({ params }: PageProps) {
  const { id } = await params
  const userId = await getSessionUserId()

  const listing = await prisma.donationListing.findUnique({
    where: { id },
    include: {
      seller: { select: { id: true, fullName: true, phone: true, createdAt: true } },
      _count: { select: { favourites: true } },
      ...(userId ? { favourites: { where: { userId }, select: { userId: true }, take: 1 } } : {}),
    },
  })

  if (!listing) notFound()

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(168,197,122,0.18),transparent_34%),linear-gradient(135deg,#f8f7f0_0%,#f4f8ee_55%,#f9f4e8_100%)]">
      <DonationHeader />
      <ListingDetail listing={serializeListing(listing)} viewerUserId={userId} />
    </div>
  )
}
