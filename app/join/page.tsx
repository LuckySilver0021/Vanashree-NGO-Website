import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth.server'
import { JoinClient } from './JoinClient'

export const metadata: Metadata = {
  title: 'Continue with Vanashree',
  description: 'Choose where you would like to continue on Vanashree.',
}

export const dynamic = 'force-dynamic'

export default async function JoinPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/auth')
  }

  return <JoinClient session={session} />
}
