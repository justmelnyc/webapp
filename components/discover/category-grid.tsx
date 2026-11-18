import Link from 'next/link'
import type { Category } from '@/types/content'
import { CategoryCard } from './category-card'
import styles from './category-grid.module.css'

/** The /discover/all view: a grid of category cards and the fixed "View Subscriptions" footer. */
export const CategoryGrid = ({ categories, isLoggedIn }: { categories: Category[]; isLoggedIn: boolean }) => (
  <div className="Discover">
    <ul className={styles.grid}>
      {categories.map((category) => (
        <CategoryCard key={category.id} category={category} isLoggedIn={isLoggedIn} />
      ))}
    </ul>
    <footer className={styles.footer}>
      <p>
        <Link href="/discover/subscribed" className={styles.button}>
          View Subscriptions
        </Link>
      </p>
    </footer>
  </div>
)
