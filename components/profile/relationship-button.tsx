'use client'

import Link from 'next/link'
import { useOptimistic, useTransition } from 'react'
import { setFollowing } from '@/actions/relationship-actions'
import { CheckIconSM, PlusIconSM } from '@/components/icons'
import { useBlockMute } from '@/components/moderation/use-block-mute'
import { toast } from '@/stores/toast-store'
import { cn } from '@/utils/cn'
import styles from './relationship-button.module.css'

interface RelationshipButtonProps {
  userId: string
  username: string
  /** The viewer's relationship priority with this user (`self`, `friend`, `none`, ...). */
  priority: string | null | undefined
  signedIn: boolean
  className?: string
}

const isFollowing = (priority: string | null | undefined): boolean => priority === 'friend' || priority === 'noise'

/** The original's RelationshipContainer + FollowButton: Follow / Following / Edit Profile / Muted / Blocked. */
export const RelationshipButton = ({ userId, username, priority, signedIn, className }: RelationshipButtonProps) => {
  const blockMute = useBlockMute({ userId, username, priority })
  const [optimistic, setOptimistic] = useOptimistic<string | null | undefined, string>(blockMute.priority, (_, next) => next)
  const [, startTransition] = useTransition()
  const shown = optimistic ?? 'inactive'
  const classes = cn('FollowButton', styles.button, className)

  if (shown === 'self') {
    return (
      <div className={cn('RelationshipContainer', styles.container)} data-priority={shown}>
        <Link href="/settings" className={classes} data-priority={shown}>
          <span>Edit Profile</span>
        </Link>
      </div>
    )
  }

  if (shown === 'mute' || shown === 'block') {
    return (
      <div className={cn('RelationshipContainer', styles.container)} data-priority={shown}>
        <button type="button" className={classes} data-priority={shown} onClick={blockMute.open}>
          <span>{shown === 'mute' ? 'Muted' : 'Blocked'}</span>
        </button>
        {blockMute.dialogs}
      </div>
    )
  }

  const following = isFollowing(shown)
  const toggle = (): void => {
    if (!signedIn) return toast.info('Log in to follow people')
    startTransition(async () => {
      setOptimistic(following ? 'inactive' : 'friend')
      const result = await setFollowing(userId, !following)
      if (!result.ok) toast.error(result.error)
    })
  }

  return (
    <div className={cn('RelationshipContainer', styles.container)} data-priority={shown}>
      <button type="button" className={classes} data-priority={shown} onClick={toggle} aria-pressed={following}>
        {following ? <CheckIconSM /> : <PlusIconSM />}
        <span>{following ? 'Following' : 'Follow'}</span>
      </button>
    </div>
  )
}
