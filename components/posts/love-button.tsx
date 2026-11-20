'use client'

import { useContext, useOptimistic, useTransition } from 'react'
import { QueryClientContext } from '@tanstack/react-query'
import { setLoved } from '@/actions/post-actions'
import { HeartIcon } from '@/components/icons'
import { Hint } from '@/components/posts/hint'
import { numberToHuman } from '@/components/posts/number-to-human'
import { useRegistrationDialog } from '@/components/auth/registration-dialog'
import { patchStreamPosts } from '@/components/streams/stream-cache'
import { toast } from '@/stores/toast-store'
import { cn } from '@/utils/cn'

interface LoveButtonProps {
  postId: string
  loved: boolean
  count: number
  /** Logged-out viewers get a prompt instead of a request. */
  signedIn: boolean
  /** Extra class on the tool (`isLightBox` inside the lightbox). */
  className?: string
}

interface LoveState {
  loved: boolean
  count: number
}

/** The original's `LoveTool`: heart button plus the love count. */
export const LoveButton = ({ postId, loved, count, signedIn, className }: LoveButtonProps) => {
  const [state, setOptimistic] = useOptimistic<LoveState, LoveState>({ loved, count }, (_, next) => next)
  const [pending, startTransition] = useTransition()
  const registration = useRegistrationDialog()
  // streams hold their posts in the query cache: without this the heart falls back once the request is done
  const queryClient = useContext(QueryClientContext)
  const toggle = (): void => {
    if (!signedIn) return registration.open('post-tools')
    startTransition(async () => {
      const next = { loved: !state.loved, count: state.count + (state.loved ? -1 : 1) }
      setOptimistic(next)
      const result = await setLoved(postId, next.loved)
      if (!result.ok) return toast.error(result.error)
      if (!queryClient) return
      patchStreamPosts(queryClient, (post) =>
        post.id !== postId
          ? post
          : {
              ...post,
              currentUserState: { ...post.currentUserState, loved: next.loved },
              postStats: { ...post.postStats, lovesCount: next.count },
            },
      )
    })
  }
  return (
    <span className={cn('PostTool LoveTool', className)} data-count={state.count}>
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
      <button
        type="button"
        tabIndex={-1}
        aria-hidden
        onClick={toggle}
        className={cn('PostToolDrawerButton', state.loved && 'isActive')}
      >
        <span className={cn('PostToolValue', state.count < 1 && 'isZero')}>
          {numberToHuman(state.count, false)}
        </span>
      </button>
    </span>
  )
}
