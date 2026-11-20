'use client'

import type { ReactNode } from 'react'
import { BadgeFeaturedIcon, CheckCircleIcon } from '@/components/icons'
import type { PageHeader } from '@/types/content'
import { cn } from '@/utils/cn'
import { useCategoryDrawer } from './category-drawer'
import { HeroInfoTrigger } from './category-info-trigger'
import { CategorySubscribeButton } from './category-subscribe-button'
import { useCategorySubscriptions } from './category-subscriptions'
import { HeroCredits, HeroCreditsCollapsed } from '@/components/heroes/hero-credits'
import frame from '@/components/heroes/hero-promotion.module.css'
import { HeroImage } from './hero-image'
import mobile from './category-hero-mobile.module.css'
import styles from './category-hero.module.css'

interface CategoryHeroProps {
  header: PageHeader
  categoryId: string
  isPromo: boolean
}

const CREDIT_LABEL = 'Posted by'

/** CategorySubscribedIcon inside the hero heading: a green disc once the viewer subscribed, an outline before. */
const HeadingCheck = () => (
  <span className={`category-check ${styles.check}`}>
    <CheckCircleIcon />
  </span>
)

/** The hero's `h1`: `subscribed` / `unsubscribed` decides how the check mark is drawn. */
const Heading = ({ categoryId, children }: { categoryId: string; children: ReactNode }) => {
  const { isSubscribed } = useCategorySubscriptions()
  const subscribed = isSubscribed(categoryId)
  return (
    <h1
      className={cn(
        subscribed ? 'subscribed' : 'unsubscribed',
        styles.heading,
        subscribed && mobile.subscribed,
      )}
    >
      {children}
    </h1>
  )
}

const Credits = ({ header }: { header: PageHeader }) => {
  const { isOpen } = useCategoryDrawer()
  if (!header.user) return null
  if (!isOpen) return <HeroCreditsCollapsed user={header.user} />
  return <HeroCredits user={header.user} label={CREDIT_LABEL} />
}

/** HeroPromotionCategory, desktop version (shown from 40em up). */
const DesktopHero = ({ header, categoryId, isPromo }: CategoryHeroProps) => (
  <div className={`${styles.desktop} ${frame.promotion}`}>
    <HeroImage image={header.image} />
    <div className={styles.caption}>
      <Heading categoryId={categoryId}>
        <span className={styles.label}>{header.header ?? ''}</span>
        <HeadingCheck />
      </Heading>
      <span className={styles.subscribeHolder}>
        <span className={styles.subscribeInner}>
          {isPromo && (
            <span className={styles.badge} title="Featured Category">
              <BadgeFeaturedIcon />
            </span>
          )}
        </span>
      </span>
    </div>
    <Credits header={header} />
  </div>
)

/** HeroPromotionCategory, mobile version while the info panel is closed (below 40em). */
const MobileHeroCollapsed = ({ header, categoryId }: CategoryHeroProps) => (
  <div className={`${frame.promotion} ${mobile.stacked} ${styles.promotionCollapsed}`}>
    <HeroImage image={header.image} />
    <div className={styles.captionCollapsed}>
      <Heading categoryId={categoryId}>
        <span className={styles.labelCollapsed}>{header.header ?? ''}</span>
        <HeadingCheck />
      </Heading>
    </div>
    <div className={styles.mobileActions}>
      <Credits header={header} />
    </div>
    <HeroInfoTrigger name={header.header ?? ''} />
  </div>
)

/** The same hero with the panel open: the name, the subscribe button and the full photo credit. */
const MobileHeroExpanded = ({ header, categoryId }: CategoryHeroProps) => (
  <div className={`${frame.promotion} ${mobile.stacked}`}>
    <HeroImage image={header.image} />
    <div className={styles.caption}>
      <Heading categoryId={categoryId}>
        <span className={cn(styles.labelCollapsed, mobile.labelOpen)}>{header.header ?? ''}</span>
      </Heading>
      <CategorySubscribeButton categoryId={categoryId} />
    </div>
    <div className={styles.mobileActions}>
      <Credits header={header} />
    </div>
    <HeroInfoTrigger name={header.header ?? ''} />
  </div>
)

const MobileHero = (props: CategoryHeroProps) => {
  const { isOpen } = useCategoryDrawer()
  return (
    <div className={styles.mobile}>
      {isOpen ? <MobileHeroExpanded {...props} /> : <MobileHeroCollapsed {...props} />}
    </div>
  )
}

export const CategoryHero = (props: CategoryHeroProps) => (
  <>
    <DesktopHero {...props} />
    <MobileHero {...props} />
  </>
)
