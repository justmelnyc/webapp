import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import { getProfile } from '@/components/profile/profile-data'
import { ProfileHero } from '@/components/profile/profile-hero'
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
    <>
      <ProfileHero user={user} signedIn={!!session} />
      <div className="UserDetails">{children}</div>
    </>
  )
}

export default ProfileLayout
