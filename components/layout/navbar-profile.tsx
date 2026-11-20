'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import { logout } from '@/actions/auth'
import { XIconLG } from '@/components/icons'
import { Avatar } from '@/components/ui/avatar'
import { cn } from '@/utils/cn'
import { useAppShell } from './app-shell'
import styles from './navbar-profile.module.css'

interface NavbarProfileProps {
  username: string
  avatarSrc: string | null
  /** Where "Help" points (the original used `${AUTH_DOMAIN}/wtf`). */
  helpHref: string
  /** Links only some people get, after "Settings" (`<NavbarAnalyticsLink />` for brands and staff). */
  children?: ReactNode
}

/** "Analytics": the original shows it to brand accounts and to staff (`isBrand || isStaff`), as a plain link. */
export const NavbarAnalyticsLink = () => (
  // eslint-disable-next-line @next/next/no-html-link-for-pages -- /manage was a page of the Rails app: the original leaves the web app for it
  <a className={styles.item} href="/manage">
    Analytics
  </a>
)

/** Avatar with its dropdown (desktop) or full screen menu (phones). */
export const NavbarProfile = ({ username, avatarSrc, helpHref, children }: NavbarProfileProps) => {
  const { isProfileMenuActive, toggleProfileMenu } = useAppShell()
  return (
    <span className={cn('NavbarProfile', styles.profile)}>
      <Avatar
        src={avatarSrc}
        name={username}
        aria-label="Your menu"
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          toggleProfileMenu()
        }}
      />
      <nav aria-label="Profile" className={cn(styles.links, isProfileMenuActive && 'isActive')}>
        <Link className={styles.item} href={`/${username}`}>{`@${username}`}</Link>
        <Link className={cn(styles.item, styles.invitesItem)} href="/invites">
          Invites
        </Link>
        <Link className={styles.item} href={`/${username}/loves`}>
          Loves
        </Link>
        <Link className={cn(styles.item, styles.giveawaysItem)} href="/elloartgiveaways">
          Giveaways
        </Link>
        <Link className={styles.item} href="/invitations">
          Invite
        </Link>
        <Link className={styles.item} href="/settings">
          Settings
        </Link>
        {children}
        <hr className={styles.divider} />
        <a className={styles.small} href={helpHref} rel="noopener noreferrer" target="_blank">
          Help
        </a>
        <form action={logout}>
          <button type="submit" className={styles.small}>
            Logout
          </button>
        </form>
        <button type="button" aria-label="Close menu" className={styles.close}>
          <XIconLG />
        </button>
      </nav>
    </span>
  )
}
