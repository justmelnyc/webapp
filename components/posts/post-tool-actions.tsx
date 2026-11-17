'use client'

import { useOptimistic, useTransition } from 'react'
import { setWatching } from '@/actions/post-actions'
import { BoltIcon, RepostIcon, ShareIcon } from '@/components/icons'
import { Hint } from '@/components/posts/hint'
import { numberToHuman } from '@/components/posts/number-to-human'
import { toast } from '@/stores/toast-store'
import { cn } from '@/utils/cn'

/** The original's `ShareTool`. Copies the post link (the share dialog is not ported). */
export const ShareTool = ({ path, isPill }: { path: string; isPill: boolean }) => {
  const share = (): void => {
    const url = `${window.location.origin}${path}`
    navigator.clipboard.writeText(url).then(
      () => toast.success('Link copied'),
      () => toast.error('Could not copy the link'),
    )
  }
  return (
    <span className={cn('PostTool ShareTool', isPill && 'isPill')}>
      <button type="button" onClick={share} aria-label="Share">
        <ShareIcon />
        <Hint>Share</Hint>
      </button>
    </span>
  )
}

/** The original's `RepostTool`. The rewrite has no repost action yet, so it only informs. */
export const RepostTool = ({ count }: { count: number }) => {
  const onRepost = (): void => toast.info('Reposting is not available yet')
  return (
    <span className="PostTool RepostTool" data-count={count}>
      <button type="button" className={cn(count > 0 && 'hasPostToolDrawer')} onClick={onRepost} aria-label="Repost">
        <RepostIcon />
        <Hint>Repost</Hint>
      </button>
      <button type="button" tabIndex={-1} aria-hidden className="PostToolDrawerButton" onClick={onRepost}>
        <span className={cn('PostToolValue', count < 1 && 'isZero')}>{numberToHuman(count, false)}</span>
      </button>
    </span>
  )
}

/** The original's `WatchTool` (list mode, other people's posts): the bolt toggles watching. */
export const WatchTool = ({ postId, watching, signedIn }: { postId: string; watching: boolean; signedIn: boolean }) => {
  const [state, setOptimistic] = useOptimistic<boolean, boolean>(watching, (_, next) => next)
  const [pending, startTransition] = useTransition()
  const toggle = (): void => {
    if (!signedIn) return void toast.info('Log in to watch posts')
    startTransition(async () => {
      const next = !state
      setOptimistic(next)
      const result = await setWatching(postId, next)
      if (!result.ok) toast.error(result.error)
    })
  }
  return (
    <span className={cn('PostTool WatchTool', state && 'isWatchingPost')}>
      <button type="button" className={cn(state && 'isActive')} onClick={toggle} disabled={pending} aria-pressed={state} aria-label={state ? 'Mute' : 'Watch'}>
        <BoltIcon />
        <Hint>{state ? 'Mute' : 'Watch'}</Hint>
      </button>
    </span>
  )
}
