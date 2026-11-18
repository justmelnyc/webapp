import Link from 'next/link'
import { Avatar } from '@/components/ui/avatar'
import type { PageHeader } from '@/types/content'
import { cn } from '@/utils/cn'
import { avatarUrl } from '@/utils/images'
import styles from './hero-credits.module.css'

/**
 * HeroPromotionCredits: the photographer's avatar (and, when expanded, "@username") in the hero's
 * bottom-right corner. `collapsed` drops the label and username, leaving only the avatar.
 */
export const HeroCredits = ({ user, collapsed = false }: { user: NonNullable<PageHeader['user']>; collapsed?: boolean }) => (
  <Link href={`/${user.username}`} className={cn('HeroPromotionCredits', collapsed ? styles.collapsed : styles.expanded)}>
    {!collapsed && <span className={styles.author}>@{user.username}</span>}
    <Avatar className={cn('inHeroPromotionCredits', styles.avatar)} src={avatarUrl(user.avatar, 'regular')} name={user.username} />
  </Link>
)
