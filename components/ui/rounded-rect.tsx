import type { ComponentProps } from 'react'
import { cn } from '@/utils/cn'
import styles from './rounded-rect.module.css'

/** The original's `RoundedRect`: a 40px outlined or filled pill-ish button (`ScrollButton`, `SubmitButton`). */
const Base = ({ className, type = 'button', ...props }: ComponentProps<'button'>) => (
  <button type={type} className={cn('RoundedRect', styles.root, className)} {...props} />
)

export const GreenRoundedRect = ({ className, ...props }: ComponentProps<'button'>) => (
  <Base className={cn(styles.green, className)} {...props} />
)

export const GreenBorderRoundedRect = ({ className, ...props }: ComponentProps<'button'>) => (
  <Base className={cn(styles.greenBorder, className)} {...props} />
)

export const BlackBorderRoundedRect = ({ className, ...props }: ComponentProps<'button'>) => (
  <Base className={cn(styles.blackBorder, className)} {...props} />
)

/** The big SUBMIT call to action (`Green isXL`). */
export const GreenXLRoundedRect = ({ className, ...props }: ComponentProps<'button'>) => (
  <Base className={cn(styles.green, styles.xl, className)} {...props} />
)
