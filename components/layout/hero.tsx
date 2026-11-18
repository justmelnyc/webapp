import { HeroHeader } from '@/components/heroes/hero-header'
import { HeroPromotionCategory } from '@/components/heroes/hero-promotion-category'
import { HeroPromotionPage } from '@/components/heroes/hero-promotion-page'
import type { PageHeader } from '@/types/content'
import { cn } from '@/utils/cn'
import styles from './hero.module.css'

interface HeroProps {
  header: PageHeader
  /**
   * `discover` reserves room for the fixed black category strip under the navbar (the original's
   * `.isDiscoverView ~ .Hero`: 160px instead of 80px). Every other page uses the default.
   */
  view?: 'default' | 'discover'
}

/**
 * The original's `.Hero` wrapper (its padding offsets the page below the fixed navbar) plus the
 * hero for the page header's kind: EDITORIAL (home), GENERIC (Discover), CATEGORY (category pages).
 */
export const Hero = ({ header, view = 'default' }: HeroProps) => (
  <div className={cn('Hero', styles.frame, view === 'discover' && styles.discover)}>
    {header.kind === 'EDITORIAL' && <HeroHeader header={header} />}
    {header.kind === 'ARTIST_INVITE' && <HeroHeader header={header} page="invites" />}
    {header.kind === 'GENERIC' && <HeroPromotionPage header={header} />}
    {header.kind === 'CATEGORY' && <HeroPromotionCategory header={header} />}
  </div>
)
