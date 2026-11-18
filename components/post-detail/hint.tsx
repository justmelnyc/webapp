import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'
import styles from './hint.module.css'

/** The original's `Hint`: a small black pill that shows on hover (always visible on pills). */
export const Hint = ({ children, className }: { children: ReactNode; className?: string }) => (
  <span className={cn('Hint', styles.hint, className)}>{children}</span>
)
