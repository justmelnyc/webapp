import { ChevronIcon } from '@/components/icons'
import styles from './category-info-trigger.module.css'

/**
 * The collapsed "Info" trigger in the top-right of a category page (CategoryInfo, collapsed).
 * The expanded info drawer is not part of the rewrite, so the trigger is presentational only.
 */
export const CategoryInfoTrigger = ({ name }: { name: string }) => (
  <p className={styles.collapsed}>
    <button type="button" className="category-info open-trigger" title={`${name} info`}>
      <span className="label">Info</span>
      <span className="icon">
        <ChevronIcon />
      </span>
    </button>
  </p>
)
