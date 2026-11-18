'use client'

import { useOptimistic, useTransition } from 'react'
import { setFollowing } from '@/actions/relationship-actions'
import { CheckCircleIcon, PlusCircleIcon } from '@/components/icons'
import { useRegistrationDialog } from '@/components/auth/registration-dialog'
import { toast } from '@/stores/toast-store'
import { cn } from '@/utils/cn'
import styles from './post-header.module.css'
import buttonStyles from './relationship-button.module.css'

interface RelationshipButtonProps {
  userId: string
  /** The author's relationship priority from the viewer's side (`self`, `friend`, ...). */
  priority: string | null | undefined
  signedIn: boolean
}

const isFollowing = (priority: string | null | undefined): boolean =>
  priority === 'friend' || priority === 'noise'

/** The follow toggle in a post header: a circle icon, `Following` / `Follow` on hover. */
export const RelationshipButton = ({ userId, priority, signedIn }: RelationshipButtonProps) => {
  const [following, setOptimistic] = useOptimistic<boolean, boolean>(
    isFollowing(priority),
    (_, next) => next,
  )
  const [, startTransition] = useTransition()
  const registration = useRegistrationDialog()
  const shown = priority === 'self' ? 'self' : following ? 'friend' : 'inactive'

  const toggle = () => {
    if (!signedIn) return registration.open('follow-button')
    startTransition(async () => {
      const next = !following
      setOptimistic(next)
      const result = await setFollowing(userId, next)
      if (!result.ok) toast.error(result.error)
    })
  }

  return (
    <div
      className={cn('RelationshipContainer isInHeader', styles.relationship)}
      data-priority={shown}
    >
      <button
        type="button"
        className={cn('FollowButton isInHeader', buttonStyles.button)}
        data-priority={shown}
        onClick={toggle}
      >
        {following ? <CheckCircleIcon /> : <PlusCircleIcon />}
        <span className={buttonStyles.label}>{following ? 'Following' : 'Follow'}</span>
      </button>
    </div>
  )
}
