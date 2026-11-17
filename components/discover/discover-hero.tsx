import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'
import { HeroCredits } from './hero-credits'
import { HeroImage } from './hero-image'
import type { PageHeader } from '@/types/content'
import styles from './discover-hero.module.css'

/** The original's `div.Hero`: reserves room for the fixed navbar (and the category strip on Discover). */
export const HeroFrame = ({ children, isDiscover = true }: { children?: ReactNode; isDiscover?: boolean }) => (
  <div className={cn('Hero', styles.hero, isDiscover && styles.discover)}>{children}</div>
)

const Cta = ({ cta }: { cta: PageHeader['ctaLink'] }) => {
  if (!cta?.text || !cta.url) return <span className={styles.cta} />
  return (
    <a className={styles.cta} href={cta.url} rel="noopener noreferrer" target="_blank">
      <span className={styles.ctaText}>{cta.text}</span>
    </a>
  )
}

/** HeroPromotionPage: the generic header under /discover, /discover/trending, ... */
export const PageHero = ({ header }: { header: PageHeader }) => (
  <div className={styles.promotion}>
    <HeroImage image={header.image} />
    <div className={styles.caption}>
      <h1 className={styles.heading}>{header.header}</h1>
      <h2 className={styles.subheading}>{header.subheader}</h2>
      <Cta cta={header.ctaLink} />
    </div>
    {header.user && <HeroCredits user={header.user} />}
  </div>
)
