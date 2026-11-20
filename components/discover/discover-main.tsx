'use client'

import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'
import { useCategoryDrawer } from './category-drawer'
import styles from './discover-main.module.css'

/**
 * The original's `MainView.Discover`. While a category's info panel is open the view becomes a
 * grid: sub navigation and posts on the left, the panel in the last column (MainView.css).
 */
export const DiscoverMain = ({ children }: { children: ReactNode }) => {
  const { isOpen } = useCategoryDrawer()
  return <div className={cn('Discover relative', isOpen && styles.drawerOpen)}>{children}</div>
}
