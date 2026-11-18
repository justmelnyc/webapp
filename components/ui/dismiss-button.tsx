'use client'

import { XIcon } from '@/components/icons'
import { cn } from '@/utils/cn'
import styles from './dismiss-button.module.css'

interface DismissButtonProps {
  onClick: () => void
  className?: string
}

/** The original's `DismissButton` (Buttons.js): the X in the top right corner of a dialog. */
export const DismissButton = ({ onClick, className }: DismissButtonProps) => (
  <button type="button" aria-label="Close" className={cn('CloseModal', styles.dismiss, className)} onClick={onClick}>
    <XIcon />
  </button>
)
