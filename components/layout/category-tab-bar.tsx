'use client'

import Link from 'next/link'
import { BadgeFeaturedIcon } from '@/components/icons'
import type { CSSProperties } from 'react'
import { cn } from '@/utils/cn'
import styles from './category-tab-bar.module.css'
import { useShownPath } from './use-pending-navigation'

export interface CategoryTab {
  label: string
  slug: string
  isPromo: boolean
  /** Tile art: the original uses `large` when there are few tabs, `small` otherwise. */
  small?: string | null
  large?: string | null
}

/** isImageSizeLarge: below 640px large art needs fewer than 4 tabs, otherwise fewer than 10. */
const tabArt = (tab: CategoryTab, count: number): CSSProperties => {
  const art = (large: boolean): string | undefined => {
    const url = large ? tab.large : tab.small
    return url ? `url("${url}")` : undefined
  }
  return { '--tab-art-mobile': art(count < 4), '--tab-art': art(count < 10) } as CSSProperties
}

interface CategoryTabBarProps {
  tabs: CategoryTab[]
  isLoggedIn: boolean
  /** The viewer subscribed to at least one category. */
  hasSubscriptions?: boolean
}

const SUBSECTIONS = /\/(trending|recent|shop)$/

const TabLabel = ({ children }: { children: string }) => (
  <span className={styles.label}>
    <span className={styles.text}>{children}</span>
  </span>
)

/**
 * Discover's category strip, shown under the navbar (CategoryTabBar.js). A signed-in viewer gets
 * the "find a category" zero state until they subscribe to a category (`selectAreCategoriesSubscribed`).
 */
export const CategoryTabBar = ({ tabs, isLoggedIn, hasSubscriptions = false }: CategoryTabBarProps) => {
  const pathname = useShownPath()
  if (!/^\/discover\b/.test(pathname) || /^\/discover\/all\b/.test(pathname)) return null
  const base = pathname.replace(SUBSECTIONS, '')
  const isAll = ['/discover', '/discover/trending', '/discover/recent', '/discover/shop'].includes(pathname)
  const isSubscribed = base === '/discover/subscribed'
  return (
    <div className={styles.bar}>
      <nav aria-label="Categories" className={styles.tabs}>
        <Link href="/discover" className={cn(styles.tab, styles.mini, styles.all, isAll && 'isActive')}>
          <TabLabel>All</TabLabel>
        </Link>
        {isLoggedIn && (
          <Link
            href="/discover/subscribed"
            className={cn(styles.tab, styles.mini, styles.subscribed, isSubscribed && 'isActive')}
          >
            <TabLabel>Subscribed</TabLabel>
          </Link>
        )}
        {tabs.map((tab) => (
          <Link
            key={tab.slug}
            href={`/discover/${tab.slug}`}
            className={cn(styles.tab, styles.art, base === `/discover/${tab.slug}` && 'isActive')}
            style={tabArt(tab, tabs.length)}
          >
            {tab.isPromo && (
              <span className={styles.badge}>
                <BadgeFeaturedIcon />
              </span>
            )}
            <TabLabel>{tab.label}</TabLabel>
          </Link>
        ))}
        {isLoggedIn && (tabs.length < 1 || !hasSubscriptions) && (
          <Link href="/discover/all" className={cn(styles.tab, styles.zeroState)}>
            <TabLabel>Find and subscribe to a category</TabLabel>
          </Link>
        )}
      </nav>
      <div className={styles.tools}>
        <Link href="/discover/all" className={styles.edit}>
          <span>Edit</span>
        </Link>
      </div>
    </div>
  )
}
