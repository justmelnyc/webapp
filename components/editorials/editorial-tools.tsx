'use client'

import Link from 'next/link'
import { useOptimistic, useTransition } from 'react'
import { setLoved } from '@/actions/post-actions'
import { BubbleIcon, HeartIcon, RepostIcon, ShareIcon } from '@/components/icons'
import { useRegistrationDialog } from '@/components/auth/registration-dialog'
import { toast } from '@/stores/toast-store'
import { cn } from '@/utils/cn'
import styles from './editorial-tools.module.css'

interface EditorialToolsProps {
  postId: string
  postPath: string
  loved: boolean
  signedIn: boolean
}

const copyLink = async (path: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(new URL(path, window.location.origin).toString())
    toast.success('Link copied')
  } catch {
    toast.error('Could not copy the link')
  }
}

/** Heart / comment / repost / share row at the bottom of a post editorial. */
export const EditorialTools = ({ postId, postPath, loved, signedIn }: EditorialToolsProps) => {
  const [isLoved, setOptimistic] = useOptimistic<boolean, boolean>(loved, (_, next) => next)
  const [pending, startTransition] = useTransition()
  const registration = useRegistrationDialog()

  const toggleLove = (): void => {
    if (!signedIn) return registration.open('editorial')
    startTransition(async () => {
      const next = !isLoved
      setOptimistic(next)
      const result = await setLoved(postId, next)
      if (!result.ok) toast.error(result.error)
    })
  }

  return (
    <div className={styles.tools}>
      <button
        type="button"
        onClick={toggleLove}
        disabled={pending}
        aria-pressed={isLoved}
        aria-label={isLoved ? 'Unlove' : 'Love'}
        className={cn(styles.button, isLoved && styles.active)}
      >
        <HeartIcon />
      </button>
      <Link href={postPath} aria-label="Comment" className={cn(styles.button, styles.spacer)}>
        <BubbleIcon />
      </Link>
      <Link href={postPath} aria-label="Repost" className={cn(styles.button, styles.spacer)}>
        <RepostIcon />
      </Link>
      <button
        type="button"
        aria-label="Share"
        onClick={() => void copyLink(postPath)}
        className={cn(styles.button, styles.end)}
      >
        <ShareIcon />
      </button>
    </div>
  )
}
