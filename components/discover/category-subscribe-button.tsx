'use client'

import type { MouseEvent } from 'react'
import { CheckCircleIcon } from '@/components/icons'
import { cn } from '@/utils/cn'
import { useCategorySubscriptions } from './category-subscriptions'
import styles from './category-subscribe-button.module.css'

interface CategorySubscribeButtonProps {
  categoryId: string
  className?: string
}

/**
 * CategorySubscribeButton: green "Subscribe", grey "Subscribed" once the viewer follows the
 * category. Logged-out visitors get the sign-up dialog.
 */
export const CategorySubscribeButton = ({
  categoryId,
  className,
}: CategorySubscribeButtonProps) => {
  const { isSubscribed, toggle } = useCategorySubscriptions()
  const subscribed = isSubscribed(categoryId)
  const onClick = (event: MouseEvent<HTMLButtonElement>): void => {
    // inside a category card the button sits in the card's link
    event.preventDefault()
    toggle(categoryId)
  }
  return (
    <button
      type="button"
      className={cn(
        'subscribe-button',
        subscribed && 'subscribed',
        styles.subscribe,
        subscribed && styles.subscribed,
        className,
      )}
      onClick={onClick}
      aria-pressed={subscribed}
    >
      <CheckCircleIcon />
      <span className="label">{subscribed ? 'Subscribed' : 'Subscribe'}</span>
    </button>
  )
}
