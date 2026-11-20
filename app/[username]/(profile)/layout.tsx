import type { ReactNode } from 'react'
import { PendingProfileStream } from '@/components/layout/pending-profile-stream'
import { getProfile } from '@/components/profile/profile-data'
import { ProfileHero } from '@/components/profile/profile-hero'
import { NotFoundError } from '@/lib/errors'
import { getSession } from '@/lib/session'
import { getAdministeredCategories } from '@/services/categories'
import { getViewer } from '@/services/viewer'
import { isRoleAdministrator } from '@/utils/category-roles'

interface LayoutProps {
  children: ReactNode
  params: Promise<{ username: string }>
}

const ProfileLayout = async ({ children, params }: LayoutProps) => {
  const { username } = await params
  const session = await getSession()
  const [user, viewer, administeredCategories] = await Promise.all([
    getProfile(decodeURIComponent(username)).catch((error: unknown) => {
      if (error instanceof NotFoundError) return null
      throw error
    }),
    getViewer(),
    // Signed-in people may administer categories: those give the Community Roles panel its assign form.
    session ? getAdministeredCategories().catch(() => []) : [],
  ])
  // The original's UserDetailContainer renders nothing at all for a user that does not exist.
  if (!user) return null
  return (
    <>
      <ProfileHero
        user={user}
        signedIn={!!session}
        isRoleAdministrator={isRoleAdministrator(viewer)}
        administeredCategories={administeredCategories}
        isStaff={!!viewer?.isStaff}
      />
      <div className="UserDetails">
        <PendingProfileStream>{children}</PendingProfileStream>
      </div>
    </>
  )
}

export default ProfileLayout
