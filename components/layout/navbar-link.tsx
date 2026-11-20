'use client'

import Link from 'next/link'
import type { MouseEventHandler, ReactNode } from 'react'
import { cn } from '@/utils/cn'
import styles from './navbar-link.module.css'
import { useShownPath } from './use-pending-navigation'

/** Links that stay highlighted on their whole section (NavbarParts.js `highlightingRules`). */
const HIGHLIGHT: Record<string, RegExp> = {
  '/following': /^\/following/,
  '/invites': /(^\/invites$)|^\/invites(?:\/.*\.?.*)/,
  '/discover/subscribed': /^\/discover/,
}

export const isNavbarLinkActive = (pathname: string, href: string): boolean => {
  const rule = HIGHLIGHT[href]
  return rule ? rule.test(pathname) : pathname === href
}

type Kind = 'LabelOnly' | 'IconOnly'

interface NavbarLinkProps {
  href: string
  label: string
  /** The icon that reveals on hover for LabelOnly links, or is shown for IconOnly links. */
  icon?: ReactNode
  /** Modifier classes (`isLogin`, `isSignUp`, `isNotificationsUnread`) plus viewport classes from navbar-link.module.css. */
  className?: string
  onClick?: MouseEventHandler<HTMLAnchorElement>
}

const NavbarLinkBase = ({ kind, href, label, icon, className, onClick }: NavbarLinkProps & { kind: Kind }) => {
  const pathname = useShownPath()
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn('NavbarLink', kind, className, styles.link, isNavbarLinkActive(pathname, href) && 'isActive')}
    >
      {icon}
      <span className={styles.label}>{label}</span>
    </Link>
  )
}

export const NavbarLink = (props: NavbarLinkProps) => <NavbarLinkBase kind="LabelOnly" {...props} />

/** Icon with the label revealed on hover (bolt, search). */
export const NavbarIconLink = (props: NavbarLinkProps) => <NavbarLinkBase kind="IconOnly" {...props} />
