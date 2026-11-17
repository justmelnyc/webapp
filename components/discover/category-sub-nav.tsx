import Link from 'next/link'
import { cn } from '@/utils/cn'
import styles from './category-sub-nav.module.css'

export type DiscoverKind = 'featured' | 'trending' | 'recent' | 'shop'

const TABS: ReadonlyArray<{ kind: DiscoverKind; label: string }> = [
  { kind: 'featured', label: 'Featured' },
  { kind: 'trending', label: 'Trending' },
  { kind: 'recent', label: 'Recent' },
  { kind: 'shop', label: 'Shop' },
]

interface CategorySubNavProps {
  /** Category slug, or undefined for the global streams. */
  slug?: string
  kind: DiscoverKind
}

/** CategorySubNav: the centered Featured / Trending / Recent / Shop tabs. */
export const CategorySubNav = ({ slug, kind }: CategorySubNavProps) => {
  const base = slug ? `/discover/${slug}` : '/discover'
  return (
    <ul className={cn('category-sub-nav', !slug && 'global', styles.nav, !slug && styles.global)}>
      {TABS.map((tab) => (
        <li key={tab.kind} className={cn(tab.kind === kind && 'selected', tab.kind === kind && styles.selected)}>
          <Link href={tab.kind === 'featured' ? base : `${base}/${tab.kind}`}>{tab.label}</Link>
        </li>
      ))}
    </ul>
  )
}
