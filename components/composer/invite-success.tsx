'use client'

import { useEffect } from 'react'
import { XIcon } from '@/components/icons'
import { useComposerStore } from '@/stores/composer-store'
import styles from './omnibar-invite.module.css'

/** The original dismisses the message by itself after 6.66 seconds. */
const AUTO_DISMISS_MS = 6660

/** BlockCollection's `showArtistInviteSuccess` panel: shown in place of the editor after a submission. */
export const InviteSuccess = () => {
  const dismiss = useComposerStore((s) => s.dismissInviteSuccess)
  useEffect(() => {
    const timer = setTimeout(dismiss, AUTO_DISMISS_MS)
    return () => clearTimeout(timer)
  }, [dismiss])
  return (
    <div className={styles.success}>
      <h2 className={styles.successTitle}>Submission received!</h2>
      <div className={styles.successBody}>
        Nice moves. Our curatorial team will review your submission. You’ll receive a notification when it’s approved.
      </div>
      <button type="button" aria-label="Close" className={styles.successDismiss} onClick={dismiss}>
        <XIcon />
      </button>
    </div>
  )
}
