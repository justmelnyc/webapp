'use client'

import { useState } from 'react'
import { cn } from '@/utils/cn'
import styles from './content-warning-button.module.css'

/** The original's `ContentWarningButton`: the warning text with a View / Hide toggle. */
export const ContentWarningButton = ({ contentWarning }: { contentWarning: string }) => {
  const [isOpen, setOpen] = useState(false)
  return (
    <button type="button" className={cn('ContentWarningButton', isOpen && 'isOpen', styles.button)} onClick={() => setOpen(!isOpen)}>
      <span>{contentWarning}</span>
      <span className={styles.label}>{isOpen ? 'Hide' : 'View'}</span>
    </button>
  )
}
