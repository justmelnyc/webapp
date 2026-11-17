'use client'

import { useRouter } from 'next/navigation'
import type { MouseEvent } from 'react'
import { CheckCircleIcon } from '@/components/icons'
import styles from './category-card.module.css'

/**
 * CategorySubscribeButton. The mock API has no category subscriptions, so the button only
 * does what the original does for logged-out visitors: it sends them to sign up.
 */
export const CategorySubscribeButton = ({ isLoggedIn }: { isLoggedIn: boolean }) => {
  const router = useRouter()
  const onClick = (event: MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault()
    if (!isLoggedIn) router.push('/join')
  }
  return (
    <button type="button" className={`subscribe-button ${styles.subscribe}`} onClick={onClick}>
      <CheckCircleIcon />
      <span className="label">Subscribe</span>
    </button>
  )
}
