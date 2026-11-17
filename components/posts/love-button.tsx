'use client'

import { useOptimistic, useTransition } from 'react'
import { setLoved } from '@/actions/post-actions'
import { HeartIcon } from '@/components/icons'
import { Hint } from '@/components/posts/hint'
import { numberToHuman } from '@/components/posts/number-to-human'
import { toast } from '@/stores/toast-store'
import { cn } from '@/utils/cn'

interface LoveButtonProps {
  postId: string
  loved: boolean
  count: number
  /** Logged-out viewers get a prompt instead of a request. */
  signedIn: boolean
}

interface LoveState {
  loved: boolean
  count: number
}

/** The original's `LoveTool`: heart button plus the love count. */
export const LoveButton = ({ postId, loved, count, signedIn }: LoveButtonProps) => {
  const [state, setOptimistic] = useOptimistic<LoveState, boolean>({ loved, count }, (current, next) => ({
    loved: next,
    count: current.count + (next ? 1 : -1),
  }))
  const [pending, startTransition] = useTransition()
  const toggle = (): void => {
    if (!signedIn) return void toast.info('Log in to love posts')
    startTransition(async () => {
      const next = !state.loved
      setOptimistic(next)
      const result = await setLoved(postId, next)
      if (!result.ok) toast.error(result.error)
    })
  }
  return (
    <span className="PostTool LoveTool" data-count={state.count}>
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        aria-pressed={state.loved}
        aria-label={state.loved ? 'Unlove' : 'Love'}
        className={cn(state.loved && 'isActive', state.count > 0 && 'hasPostToolDrawer')}
      >
        <HeartIcon />
        <Hint>Love</Hint>
      </button>
      <button type="button" tabIndex={-1} aria-hidden onClick={toggle} className={cn('PostToolDrawerButton', state.loved && 'isActive')}>
        <span className={cn('PostToolValue', state.count < 1 && 'isZero')}>{numberToHuman(state.count, false)}</span>
      </button>
    </span>
  )
}
