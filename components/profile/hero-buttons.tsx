'use client'

import type { MouseEvent } from 'react'
import { ChevronCircleIcon, RolesIcon, ShareIcon } from '@/components/icons'
import { useProfileRolesStore } from '@/stores/profile-roles-store'
import { toast } from '@/stores/toast-store'
import { cn } from '@/utils/cn'
import styles from './user-profile.module.css'

/** AppContainer.onClickScrollToContent: scroll past the hero. */
export const HeroScrollToContentButton = () => {
  const onClick = (event: MouseEvent<HTMLButtonElement>): void => {
    const hero = event.currentTarget.closest('.Hero')
    if (hero instanceof HTMLElement) window.scrollTo({ top: hero.offsetHeight, behavior: 'smooth' })
  }
  return (
    <button type="button" className={cn('HeroScrollToContentButton', styles.heroButton, styles.scroll)} onClick={onClick} aria-label="Scroll to content">
      <ChevronCircleIcon />
    </button>
  )
}

/** The original opens a share dialog; here we use the native share sheet or copy the link. */
const shareProfile = async (): Promise<void> => {
  const url = window.location.href
  try {
    if (typeof navigator.share === 'function') await navigator.share({ url })
    else {
      await navigator.clipboard.writeText(url)
      toast.success('Link copied')
    }
  } catch {
    // the share sheet was dismissed
  }
}

/** The phone-sized share button inside the names cell (UserShareButton.inUserProfile). */
export const UserShareButton = () => (
  <button type="button" className={cn('UserShareButton inUserProfile', styles.shareSmall)} onClick={shareProfile} aria-label="Share profile">
    <ShareIcon />
  </button>
)

export const HeroShareUserButton = () => {
  const onClick = shareProfile
  return (
    <button type="button" className={cn('HeroShareUserButton', styles.heroButton, styles.share)} onClick={onClick} aria-label="Share profile">
      <ShareIcon />
    </button>
  )
}

/** `HeroUserRolesButton`: left of the share button, only for people who hold a category role. */
export const HeroUserRolesButton = () => {
  const isOpen = useProfileRolesStore((state) => state.isOpen)
  const setOpen = useProfileRolesStore((state) => state.setOpen)
  return (
    <button
      type="button"
      className={cn('HeroUserRolesButton', styles.heroButton, styles.share, styles.rolesHero)}
      aria-label="Community roles"
      onClick={() => setOpen(!isOpen)}
    >
      <RolesIcon />
    </button>
  )
}
