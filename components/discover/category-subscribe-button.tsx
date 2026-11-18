'use client'

import { useRegistrationDialog } from '@/components/auth/registration-dialog'
import type { MouseEvent } from 'react'
import { CheckCircleIcon } from '@/components/icons'
import styles from './category-card.module.css'

/**
 * CategorySubscribeButton. The mock API has no category subscriptions, so the button only
 * does what the original does for logged-out visitors: it opens the sign-up dialog.
 */
export const CategorySubscribeButton = ({ isLoggedIn }: { isLoggedIn: boolean }) => {
  const registration = useRegistrationDialog()
  const onClick = (event: MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault()
    if (!isLoggedIn) registration.open('subscribe-from-page-header')
  }
  return (
    <button type="button" className={`subscribe-button ${styles.subscribe}`} onClick={onClick}>
      <CheckCircleIcon />
      <span className="label">Subscribe</span>
    </button>
  )
}
