import { BackgroundImage } from '@/components/heroes/background-image'
import { HeroCreditsCollapsed } from '@/components/heroes/hero-credits'
import { CheckCircleIcon } from '@/components/icons'
import type { PageHeader } from '@/types/content'
import { cn } from '@/utils/cn'
import { responsiveUrl } from '@/utils/images'
import styles from './hero-promotion-category.module.css'
import frame from './hero-promotion.module.css'

/**
 * Port of `HeroPromotionCategory` for category pages: the category name at 144px (scaling with the
 * viewport) with the check-circle, over the page header image, with the credit avatar in the corner.
 */
export const HeroPromotionCategory = ({ header }: { header: PageHeader }) => (
  <div className={cn(frame.promotion, styles.root)}>
    <BackgroundImage src={responsiveUrl(header.image)} overlay={4} />
    <div className={styles.caption}>
      <h1 className={cn(styles.heading, styles.unsubscribed)}>
        <span className={styles.label}>{header.header}</span>
        <span className={cn('category-check', styles.check)}>
          <CheckCircleIcon />
        </span>
      </h1>
      <span className={styles.subscribeHolder} />
    </div>
    {header.user && <HeroCreditsCollapsed user={header.user} />}
  </div>
)
