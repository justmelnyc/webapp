import Link from 'next/link'
import { Avatar } from '@/components/ui/avatar'
import type { Author } from '@/types/user'
import { cn } from '@/utils/cn'
import { avatarUrl } from '@/utils/images'
import styles from './hero-credits.module.css'

interface HeroCreditsProps {
  user: Author
  /** e.g. "Posted by" */
  label?: string
  /** Positions the credit like the original's `.HeroHeader` / `.Editorial` context. */
  className?: string
}

/** The original's expanded `HeroPromotionCredits`: label, underlined @username and avatar. */
export const HeroCredits = ({ user, label, className }: HeroCreditsProps) => (
  <Link href={`/${user.username}`} className={cn('HeroPromotionCredits', styles.expanded, className)}>
    {label && <span className={styles.by}>{label}</span>}
    <span className={cn(styles.author, label && styles.withLabel)}>@{user.username}</span>
    <Avatar src={avatarUrl(user.avatar, 'regular')} name={user.username} className={styles.avatar} />
  </Link>
)

/** The collapsed credit: just the avatar in the corner (category heroes). */
export const HeroCreditsCollapsed = ({ user }: { user: Author }) => (
  <Link href={`/${user.username}`} className={cn('HeroPromotionCredits', styles.collapsed)}>
    <Avatar src={avatarUrl(user.avatar, 'regular')} name={user.username} className={styles.avatar} />
  </Link>
)

export const heroCreditsEditorial = styles.editorial
