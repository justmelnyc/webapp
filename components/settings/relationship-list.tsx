import Link from 'next/link'
import { RelationshipButton } from '@/components/profile/relationship-button'
import { TreeSection } from '@/components/settings/tree-section'
import { Avatar } from '@/components/ui/avatar'
import type { Viewer } from '@/types/user'
import { cn } from '@/utils/cn'
import { avatarUrl } from '@/utils/images'
import styles from './relationship-list.module.css'

type ListedUser = Pick<Viewer, 'id' | 'username' | 'avatar'>

interface RelationshipListProps {
  title: string
  /** The original's stream class: `BlockedUsers` or `MutedUsers`. */
  streamClassName: string
  /** What the viewer did to everyone listed. */
  priority: 'block' | 'mute'
  users: ListedUser[]
}

/** The original's `UserCompact`: avatar, @username and the Blocked / Muted button that opens the block dialog. */
const UserCompact = ({ user, priority }: { user: ListedUser; priority: 'block' | 'mute' }) => (
  <div className={cn('UserCompact', styles.compact)}>
    <div className={cn('UserCompactHeader', styles.header)}>
      <Link className={cn('UserCompactUserLink truncate', styles.userLink)} href={`/${user.username}`}>
        <Avatar src={avatarUrl(user.avatar, 'regular')} name={user.username} />
        <span className={cn('UserCompactUsername', styles.username)}>{`@${user.username}`}</span>
      </Link>
    </div>
    <RelationshipButton userId={user.id} username={user.username} priority={priority} signedIn />
  </div>
)

/**
 * The settings page's "Blocked users" / "Muted users" sections (the original shows each only while the
 * profile's count is above zero): the people in a compact list.
 */
export const RelationshipList = ({ title, streamClassName, priority, users }: RelationshipListProps) => (
  <div>
    <TreeSection title={title}>
      <section className={cn('StreamContainer', streamClassName, styles.stream)}>
        {users.map((user) => (
          <UserCompact key={user.id} user={user} priority={priority} />
        ))}
      </section>
    </TreeSection>
  </div>
)
