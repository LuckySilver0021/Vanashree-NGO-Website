import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import MapsClient from './MapsClient'

export default async function MapsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    redirect('/')
  }

  return <MapsClient />
}
