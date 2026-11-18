import {
  HeroScrollToContentButton,
  HeroShareUserButton,
  HeroUserRolesButton,
  UserShareButton,
} from '@/components/profile/hero-buttons'
import { BlockMuteButton } from '@/components/moderation/block-mute-button'
import { ProfilePillButtons } from '@/components/profile/profile-pill-buttons'
import { RolesButton } from '@/components/profile/roles-button'
import { UserRolesPanel } from '@/components/profile/user-roles-panel'
import { RelationshipButton } from '@/components/profile/relationship-button'
import { numberToHuman } from '@/components/profile/number-to-human'
import {
  UserFiguresCell,
  UserInfoCell,
  UserLinksCell,
  UserLocation,
  UserNamesCell,
  UserStatsCell,
} from '@/components/profile/user-cells'
import { Avatar } from '@/components/ui/avatar'
import { avatarUrl } from '@/utils/images'
import { cn } from '@/utils/cn'
import { cleanHtml } from '@/utils/sanitize'
import { truncateHtml } from '@/utils/truncate-html'
import type { User } from '@/types/user'
import styles from './user-profile.module.css'

interface ProfileHeroProps {
  user: User
  signedIn: boolean
}

const isSafeUrl = (url: string): boolean => /^https?:\/\//i.test(url)

/** Cover images ship in density variants; the original asked for the xhdpi one. */
const coverUrl = (user: User): string | null => {
  const cover = user.coverImage
  return cover?.xhdpi?.url ?? cover?.hdpi?.url ?? cover?.optimized?.url ?? cover?.original?.url ?? null
}

/** The original's `Hero` > `HeroProfile` (UserDetail hero). */
export const ProfileHero = ({ user, signedIn }: ProfileHeroProps) => {
  const { userStats: stats } = user
  const cover = coverUrl(user)
  const priority = user.currentUserState?.relationshipPriority
  const links = (user.externalLinksList ?? []).filter((link) => isSafeUrl(link.url))
  const fullBio = user.formattedShortBio ? cleanHtml(user.formattedShortBio) : ''
  const truncatedBio = truncateHtml(fullBio, 160)
  // the original offers See More once the (truncated) bio text reaches 150 characters
  const isBioTruncated = truncatedBio.text.length >= 150
  const displayName = user.name || user.username
  const views = stats.totalViewsCount ? numberToHuman(stats.totalViewsCount, false) : ''

  return (
    <div className={cn('Hero', styles.hero)}>
      <div className={styles.profile}>
        <div className={cn('BackgroundImage inHeroProfile hasOverlay6', styles.background)}>
          <figure className={styles.backgroundImage} style={cover ? { backgroundImage: `url(${cover})` } : undefined} />
        </div>
        <div className={cn('UserProfile', styles.userProfile)}>
          <Avatar src={avatarUrl(user.avatar, 'large')} name={displayName} className={cn('inUserProfile', styles.avatar)} />
          <UserNamesCell className={cn('inUserProfile', styles.names)} name={user.name} username={user.username}>
            {user.location ? <UserLocation location={user.location} /> : null}
            <UserShareButton />
            <RolesButton />
            {signedIn && priority !== 'self' ? (
              <BlockMuteButton userId={user.id} username={user.username} priority={priority} />
            ) : null}
          </UserNamesCell>
          {views ? <UserFiguresCell className="inUserProfile" totalViewsCount={views} /> : null}
          <UserStatsCell
            className="inUserProfile"
            username={user.username}
            postsCount={stats.postsCount}
            followingCount={stats.followingCount}
            followersCount={stats.followersCount}
            lovesCount={stats.lovesCount}
          />
          <UserInfoCell className="inUserProfile" bioHtml={truncatedBio.html} fullBioHtml={isBioTruncated ? fullBio : undefined} />
          <UserLinksCell className="inUserProfile" links={links} />
          <div className={cn('UserProfileButtons inUserProfile', styles.buttons)}>
            <ProfilePillButtons
              userId={user.id}
              name={displayName}
              signedIn={signedIn}
              isCollaborateable={!!user.settings?.isCollaborateable}
              isHireable={!!user.settings?.isHireable}
            />
            <RelationshipButton
              userId={user.id}
              username={user.username}
              priority={priority}
              signedIn={signedIn}
              className="isPill inUserProfile"
            />
          </div>
          <UserRolesPanel roles={user.categoryUsers ?? []} />
        </div>
        {user.categoryUsers?.length ? <HeroUserRolesButton /> : null}
        <HeroShareUserButton />
        <HeroScrollToContentButton />
      </div>
    </div>
  )
}
