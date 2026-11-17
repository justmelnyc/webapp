import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import { getProfile } from '@/components/profile/profile-data'
import { ProfileHeader } from '@/components/profile/profile-header'
import { ProfileTabs } from '@/components/profile/profile-tabs'
import { NotFoundError } from '@/lib/errors'
import { getSession } from '@/lib/session'

interface LayoutProps {
  children: ReactNode
  params: Promise<{ username: string }>
}

const ProfileLayout = async ({ children, params }: LayoutProps) => {
  const { username } = await params
  const [user, session] = await Promise.all([
    getProfile(decodeURIComponent(username)).catch((error: unknown) => {
      if (error instanceof NotFoundError) notFound()
      throw error
    }),
    getSession(),
  ])
  return (
    <div className="flex flex-col gap-6">
      <ProfileHeader user={user} signedIn={!!session} />
      <ProfileTabs username={user.username} />
      {children}
    </div>
  )
}

export default ProfileLayout
