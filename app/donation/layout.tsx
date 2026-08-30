import { PostDonationFab } from '@/components/donation/PostDonationFab'

export default function DonationLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <PostDonationFab />
    </>
  )
}
