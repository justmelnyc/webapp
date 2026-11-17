import { BadgeFeaturedIcon, CheckCircleIcon } from '@/components/icons'
import type { PageHeader } from '@/types/content'
import { HeroCredits } from './hero-credits'
import { HeroImage } from './hero-image'
import styles from './category-hero.module.css'

interface CategoryHeroProps {
  header: PageHeader
  isPromo: boolean
}

const Heading = ({ name, collapsed }: { name: string; collapsed?: boolean }) => (
  <h1 className={styles.heading}>
    <span className={collapsed ? styles.labelCollapsed : styles.label}>{name}</span>
    <span className={`category-check ${styles.check}`}>
      <CheckCircleIcon />
    </span>
  </h1>
)

/** HeroPromotionCategory, desktop version (shown from 40em up). */
const DesktopHero = ({ header, isPromo }: CategoryHeroProps) => (
  <div className={`${styles.desktop} ${styles.promotion}`}>
    <HeroImage image={header.image} />
    <div className={styles.caption}>
      <Heading name={header.header ?? ''} />
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
    {header.user && <HeroCredits user={header.user} collapsed />}
  </div>
)

/** HeroPromotionCategory, mobile version with the info drawer collapsed (below 40em). */
const MobileHero = ({ header }: CategoryHeroProps) => (
  <div className={styles.mobile}>
    <div className={`${styles.promotion} ${styles.promotionCollapsed}`}>
      <HeroImage image={header.image} />
      <div className={styles.captionCollapsed}>
        <Heading name={header.header ?? ''} collapsed />
      </div>
      <div className={styles.mobileActions}>{header.user && <HeroCredits user={header.user} collapsed />}</div>
    </div>
  </div>
)

export const CategoryHero = (props: CategoryHeroProps) => (
  <>
    <DesktopHero {...props} />
    <MobileHero {...props} />
  </>
)
