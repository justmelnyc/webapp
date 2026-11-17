'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'
import styles from './navbar-link.module.css'

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
}

const NavbarLinkBase = ({ kind, href, label, icon, className }: NavbarLinkProps & { kind: Kind }) => {
  const pathname = usePathname()
  return (
    <Link
      href={href}
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
