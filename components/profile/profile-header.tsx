import { EditProfileLink, FollowButton } from '@/components/profile/follow-button'
import { ProfileStats } from '@/components/profile/profile-stats'
import { Avatar } from '@/components/ui/avatar'
import { ElloImage } from '@/components/ui/ello-image'
import { avatarUrl, responsiveVersion } from '@/utils/images'
import { cleanHtml } from '@/utils/sanitize'
import type { User } from '@/types/user'

interface ProfileHeaderProps {
  user: User
  signedIn: boolean
}

const hostname = (url: string): string => {
  try {
    return new URL(url).hostname
  } catch {
    return url
  }
}

const isSafeUrl = (url: string): boolean => /^https?:\/\//i.test(url)

export const ProfileHeader = ({ user, signedIn }: ProfileHeaderProps) => {
  const cover = responsiveVersion(user.coverImage)
  const priority = user.currentUserState?.relationshipPriority
  const links = (user.externalLinksList ?? []).filter((link) => isSafeUrl(link.url))
  const bio = user.formattedShortBio ? cleanHtml(user.formattedShortBio) : ''
  const displayName = user.name || user.username

  return (
    <header className="flex flex-col gap-4">
      {cover?.url && (
        <ElloImage
          src={cover.url}
          alt=""
          width={cover.metadata?.width ?? 1200}
          height={cover.metadata?.height ?? 400}
          className="h-48 w-full rounded-sm object-cover sm:h-64"
        />
      )}
      <div className="flex flex-wrap items-center gap-4">
        <Avatar src={avatarUrl(user.avatar, 'large')} name={displayName} size={80} />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-2xl font-medium">{displayName}</h1>
          <p className="text-ash">@{user.username}</p>
        </div>
        {priority === 'self' ? (
          <EditProfileLink />
        ) : (
          <FollowButton userId={user.id} following={priority === 'friend'} signedIn={signedIn} />
        )}
      </div>
      {bio && <div className="prose-sm max-w-2xl [&_a]:underline" dangerouslySetInnerHTML={{ __html: bio }} />}
      {(user.location || links.length > 0) && (
        <ul className="text-ash flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {user.location && <li>{user.location}</li>}
          {links.map((link) => (
            <li key={link.url}>
              <a href={link.url} target="_blank" rel="noopener noreferrer nofollow" className="hover:text-ink underline">
                {link.text || hostname(link.url)}
              </a>
            </li>
          ))}
        </ul>
      )}
      <ProfileStats stats={user.userStats} />
    </header>
  )
}
