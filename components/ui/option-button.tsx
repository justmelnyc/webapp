import type { ComponentProps } from 'react'
import { cn } from '@/utils/cn'
import styles from './option-button.module.css'

interface OptionButtonProps extends ComponentProps<'button'> {
  active: boolean
}

/** One of two choices on a row (the original's creator type buttons): outlined grey, black once picked. */
export const OptionButton = ({ active, className, type = 'button', ...props }: OptionButtonProps) => (
  <button type={type} className={cn(styles.option, active && styles.active, className)} {...props} />
)

/** A multi-select choice, three to a row (the creator type categories): pressed again, it is unpicked. */
export const CategoryOptionButton = ({ active, className, ...props }: OptionButtonProps) => (
  <OptionButton active={active} aria-pressed={active} className={cn(styles.category, className)} {...props} />
)
