import Link from 'next/link'
import { RelationshipButton } from '@/components/profile/relationship-button'
import { UserInfoCell, UserNamesCellCard, UserStatsCell } from '@/components/profile/user-cells'
import { Avatar } from '@/components/ui/avatar'
import { cn } from '@/utils/cn'
import { avatarUrl } from '@/utils/images'
import { cleanHtml } from '@/utils/sanitize'
import type { Avatar as AvatarImages, ResponsiveImage } from '@/types/image'
import styles from './user-card.module.css'

export interface UserCardData {
  id: string
  username: string
  name?: string | null
  avatar?: AvatarImages | null
  coverImage?: ResponsiveImage | null
  bioHtml?: string | null
  relationshipPriority?: string | null
  postsCount: number
  followingCount: number
  followersCount: number
  lovesCount: number
}

const coverUrl = (cover: ResponsiveImage | null | undefined): string | null =>
  cover?.xhdpi?.url ?? cover?.hdpi?.url ?? cover?.optimized?.url ?? cover?.original?.url ?? null

/** The original's UserProfileCard (a cover, avatar, follow pill, name, stats and bio). */
export const UserCard = ({ user, signedIn }: { user: UserCardData; signedIn: boolean }) => {
  const href = `/${encodeURIComponent(user.username)}`
  const cover = coverUrl(user.coverImage)
  return (
    <div className={cn('UserProfileCard', styles.card)}>
      <Avatar
        src={avatarUrl(user.avatar, 'large')}
        name={user.username}
        href={href}
        className={cn('inUserProfileCard', styles.avatar)}
      />
      <div className={cn('UserProfileButtons inUserProfileCard', styles.buttons)}>
        <RelationshipButton
          userId={user.id}
          priority={user.relationshipPriority}
          signedIn={signedIn}
          className="isPill inUserProfileCard"
        />
      </div>
      <UserNamesCellCard className="inUserProfileCard" name={user.name} username={user.username} />
      <UserStatsCell
        className="inUserProfileCard"
        username={user.username}
        postsCount={user.postsCount}
        followingCount={user.followingCount}
        followersCount={user.followersCount}
        lovesCount={user.lovesCount}
      />
      <UserInfoCell className="inUserProfileCard" bioHtml={user.bioHtml ? cleanHtml(user.bioHtml) : ''} />
      <Link href={href} className={cn('BackgroundImage inUserProfileCard hasOverlay6 isLink', styles.background)} aria-label={`@${user.username}`}>
        <figure className={styles.backgroundImage} style={cover ? { backgroundImage: `url(${cover})` } : undefined} />
      </Link>
    </div>
  )
}
