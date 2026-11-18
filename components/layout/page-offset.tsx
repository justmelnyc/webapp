import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'
import styles from './hero.module.css'

/**
 * The original's `MainView` sits below the fixed navbar. In this app each page offsets itself; this is the
 * same 80px (85px on phones when signed in) the `Hero` wrapper uses, for pages without a hero.
 */
export const PageOffset = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cn(styles.frame, className)}>{children}</div>
)
