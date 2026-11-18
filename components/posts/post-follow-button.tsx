'use client'

import { useOptimistic, useTransition } from 'react'
import { useRegistrationDialog } from '@/components/auth/registration-dialog'
import { setFollowing } from '@/actions/relationship-actions'
import { CheckCircleIcon, PlusCircleIcon } from '@/components/icons'
import { toast } from '@/stores/toast-store'

interface PostFollowButtonProps {
  userId: string
  /** The viewer's relationship with the author (`friend`, `noise`, `inactive`, `self`, ...). */
  priority: string | null | undefined
  signedIn: boolean
}

const FOLLOWING = ['friend', 'noise']

/** The icon-only follow toggle in a post header (`RelationshipContainer.isInHeader`). */
export const PostFollowButton = ({ userId, priority, signedIn }: PostFollowButtonProps) => {
  const following = FOLLOWING.includes(priority ?? '')
  const [state, setOptimistic] = useOptimistic<boolean, boolean>(following, (_, next) => next)
  const [pending, startTransition] = useTransition()
  const registration = useRegistrationDialog()
  const current = priority === 'self' ? 'self' : state ? 'friend' : (priority ?? 'inactive')

  const toggle = (): void => {
    if (!signedIn) return registration.open('follow-button')
    startTransition(async () => {
      const next = !state
      setOptimistic(next)
      const result = await setFollowing(userId, next)
      if (!result.ok) toast.error(result.error)
    })
  }

  return (
    <div className="RelationshipContainer isInHeader" data-priority={current}>
      <button
        type="button"
        className="FollowButton isInHeader"
        data-priority={current}
        onClick={toggle}
        disabled={pending}
        aria-pressed={state}
        aria-label={state ? 'Unfollow' : 'Follow'}
      >
        {state ? <CheckCircleIcon /> : <PlusCircleIcon />}
        <span className="FollowButtonLabel">{state ? 'Following' : 'Follow'}</span>
      </button>
    </div>
  )
}
