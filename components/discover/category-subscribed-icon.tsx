'use client'

import { CheckCircleIcon } from '@/components/icons'
import { useCategorySubscriptions } from './category-subscriptions'
import styles from './category-subscribed-icon.module.css'

/** CategorySubscribedIcon: the green check before the name of a category the viewer subscribed to. */
export const CategorySubscribedIcon = ({ categoryId }: { categoryId: string }) => {
  const { isSubscribed } = useCategorySubscriptions()
  if (!isSubscribed(categoryId)) return null
  return (
    <span className={`category-check ${styles.check}`}>
      <CheckCircleIcon />
    </span>
  )
}
