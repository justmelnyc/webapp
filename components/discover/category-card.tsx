import Link from 'next/link'
import { BadgeFeaturedIcon } from '@/components/icons'
import type { Category } from '@/types/content'
import { avatarUrl } from '@/utils/images'
import { CategorySubscribeButton } from './category-subscribe-button'
import { CategorySubscribedIcon } from './category-subscribed-icon'
import styles from './category-card.module.css'

/** CategoryCard: a square tile in the /discover/all grid. */
export const CategoryCard = ({ category }: { category: Category }) => {
  const image = avatarUrl(category.tileImage, 'large')
  return (
    <li className={styles.card}>
      <Link
        href={`/discover/${category.slug}`}
        className={styles.link}
        style={image ? { backgroundImage: `url("${image}")` } : undefined}
      >
        {category.level === 'promo' && (
          <span className={`featured-badge ${styles.badge}`}>
            <BadgeFeaturedIcon />
          </span>
        )}
        <span className={`title-holder ${styles.title}`}>
          <CategorySubscribedIcon categoryId={category.id} />
          <span className="label">{category.name}</span>
        </span>
        <span className={`button-holder ${styles.buttonHolder}`}>
          <CategorySubscribeButton categoryId={category.id} />
        </span>
      </Link>
    </li>
  )
}
