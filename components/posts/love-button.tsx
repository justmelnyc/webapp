'use client'

import { useOptimistic, useTransition } from 'react'
import { setLoved } from '@/actions/post-actions'
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

export const LoveButton = ({ postId, loved, count, signedIn }: LoveButtonProps) => {
  const [state, setOptimistic] = useOptimistic<LoveState, boolean>({ loved, count }, (current, next) => ({
    loved: next,
    count: current.count + (next ? 1 : -1),
  }))
  const [pending, startTransition] = useTransition()

  const toggle = () => {
    if (!signedIn) return toast.info('Log in to love posts')
    startTransition(async () => {
      const next = !state.loved
      setOptimistic(next)
      const result = await setLoved(postId, next)
      if (!result.ok) toast.error(result.error)
    })
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-pressed={state.loved}
      aria-label={state.loved ? 'Unlove' : 'Love'}
      className={cn('flex items-center gap-1 text-sm transition-colors', state.loved ? 'text-ello-red' : 'text-ash hover:text-ink')}
    >
      <span aria-hidden>{state.loved ? '♥' : '♡'}</span>
      {state.count > 0 && <span>{state.count}</span>}
    </button>
  )
}
