'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { MouseEvent, ReactNode } from 'react'
import styles from './user-cells.module.css'

interface UserStatsLinkProps {
  href: string
  disabled?: boolean
  children: ReactNode
}

/** Inside the profile hero a stat link scrolls the content into view (AppContainer.onClickScrollToContent). */
const scrollToContent = (event: MouseEvent<HTMLElement>): void => {
  const hero = event.currentTarget.closest('.Hero')
  if (hero instanceof HTMLElement) window.scrollTo({ top: hero.offsetHeight, behavior: 'smooth' })
}

/** One `dl` of the stats cell: the stat of the current tab is highlighted like the original's `.isUserDetail*` rules. */
export const UserStatsLink = ({ href, disabled = false, children }: UserStatsLinkProps) => {
  const active = usePathname() === href
  return (
    <dl data-active={active ? '' : undefined}>
      {disabled ? (
        <span className={`UserStatsLink asDisabled ${styles.statsLink}`} data-disabled="">
          {children}
        </span>
      ) : (
        <Link href={href} onClick={scrollToContent} className={`UserStatsLink ${styles.statsLink}`}>
          {children}
        </Link>
      )}
    </dl>
  )
}
