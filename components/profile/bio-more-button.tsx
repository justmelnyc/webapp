'use client'

import { useState } from 'react'
import { BioDialog } from '@/components/moderation/bio-dialog'
import styles from './bio-more-button.module.css'

/** `MoreBioButton`: opens the full bio. `html` is the sanitised, untruncated bio. */
export const BioMoreButton = ({ html }: { html: string }) => {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button type="button" className={`MoreBioButton ${styles.more}`} onClick={() => setOpen(true)}>
        <span className={styles.label}>See More</span>
      </button>
      {open ? <BioDialog html={html} onDismiss={() => setOpen(false)} /> : null}
    </>
  )
}
