import Link from 'next/link'
import { MarkerIcon } from '@/components/icons'
import { BioMoreButton } from '@/components/profile/bio-more-button'
import { UserStatsLink } from '@/components/profile/user-stats-link'
import { numberToHuman } from '@/components/profile/number-to-human'
import { cn } from '@/utils/cn'
import type { ReactNode } from 'react'
import styles from './user-cells.module.css'

interface CellProps {
  className?: string
}

interface NamesProps extends CellProps {
  name?: string | null
  username: string
  children?: ReactNode
}

const NameLink = ({ name, username }: Pick<NamesProps, 'name' | 'username'>) => (
  <Link className={cn('truncate', styles.truncate)} href={`/${encodeURIComponent(username)}`}>
    {name || `@${username}`}
  </Link>
)

/** The profile hero's name block (h1 / h2, location). */
export const UserNamesCell = ({ className, name, username, children }: NamesProps) => (
  <div className={cn('UserCell UserNamesCell', styles.cell, styles.names, className)}>
    <h1 className={cn('UserName', styles.name)}>
      <NameLink name={name} username={username} />
    </h1>
    {name ? <h2 className={cn(styles.username, styles.truncate)}>@{username}</h2> : null}
    {children}
  </div>
)

/** The profile card's name block (h2 / h3). */
export const UserNamesCellCard = ({ className, name, username }: NamesProps) => (
  <div className={cn('UserCell UserNamesCell', styles.cell, styles.names, className)}>
    <h2 className={cn('UserName', styles.name)}>
      <NameLink name={name} username={username} />
    </h2>
    {name ? <h3 className={cn(styles.username, styles.truncate)}>@{username}</h3> : null}
  </div>
)

export const UserLocation = ({ location }: { location: string }) => (
  <span className={styles.location}>
    <MarkerIcon />
    {location}
  </span>
)

export const UserFiguresCell = ({ className, totalViewsCount }: CellProps & { totalViewsCount: string }) => (
  <div className={cn('UserCell', styles.cell, styles.figures, className)}>
    <div className={styles.totals}>
      <span className={styles.figuresCount}>{totalViewsCount}</span>
      <span className={styles.figuresLabel}>Views</span>
    </div>
  </div>
)

interface StatsProps extends CellProps {
  username: string
  postsCount: number
  followingCount: number
  followersCount: number
  lovesCount: number
}

const Stat = ({ value, label }: { value: number; label: string }) => (
  <>
    <dt>{numberToHuman(value)}</dt>
    <dd>
      <span className={styles.statsLabel}>{label}</span>
    </dd>
  </>
)

export const UserStatsCell = ({ className, username, postsCount, followingCount, followersCount, lovesCount }: StatsProps) => {
  const base = `/${encodeURIComponent(username)}`
  return (
    <div className={cn('UserCell UserStatsCell', styles.cell, styles.stats, className)}>
      <UserStatsLink href={base}>
        <Stat value={postsCount} label="Posts" />
      </UserStatsLink>
      <UserStatsLink href={`${base}/following`} disabled={!followingCount}>
        <Stat value={followingCount} label="Following" />
      </UserStatsLink>
      <UserStatsLink href={`${base}/followers`} disabled={!followersCount}>
        <Stat value={followersCount} label="Followers" />
      </UserStatsLink>
      <UserStatsLink href={`${base}/loves`} disabled={!lovesCount}>
        <Stat value={lovesCount} label="Loves" />
      </UserStatsLink>
    </div>
  )
}

interface InfoProps extends CellProps {
  /** Must already be sanitised (and truncated, as the original's `truncatedShortBio`). */
  bioHtml: string
  /** The whole sanitised bio: when given, a See More button opens it in a dialog. */
  fullBioHtml?: string
}

export const UserInfoCell = ({ className, bioHtml, fullBioHtml }: InfoProps) => (
  <div className={cn('UserCell UserInfoCell', styles.cell, styles.info, className)}>
    {bioHtml ? <div className={styles.bio} dangerouslySetInnerHTML={{ __html: bioHtml }} /> : null}
    {fullBioHtml ? <BioMoreButton html={fullBioHtml} /> : null}
  </div>
)

export interface UserLink {
  url: string
  text?: string | null
}

const hostname = (url: string): string => {
  try {
    return new URL(url).hostname
  } catch {
    return url
  }
}

export const UserLinksCell = ({ className, links }: CellProps & { links: UserLink[] }) => (
  <div className={cn('UserCell UserLinksCell', styles.cell, styles.links, className)}>
    <div className={styles.linksLeft}>
      {links.map((link) => (
        <span className={styles.linkLabel} key={link.url}>
          <a href={link.url} rel="noopener noreferrer nofollow" target="_blank">
            {link.text || hostname(link.url)}
          </a>
        </span>
      ))}
    </div>
  </div>
)
