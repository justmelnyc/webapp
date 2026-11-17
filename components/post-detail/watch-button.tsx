'use client'

import { useOptimistic, useTransition } from 'react'
import { setWatching } from '@/actions/post-actions'
import { OutlineButton } from '@/components/ui/button'
import { toast } from '@/stores/toast-store'

interface WatchButtonProps {
  postId: string
  watching: boolean
  /** Logged-out viewers get a prompt instead of a request. */
  signedIn: boolean
}

export const WatchButton = ({ postId, watching, signedIn }: WatchButtonProps) => {
  const [state, setOptimistic] = useOptimistic<boolean, boolean>(watching, (_current, next) => next)
  const [pending, startTransition] = useTransition()

  const toggle = () => {
    if (!signedIn) return toast.info('Log in to watch posts')
    startTransition(async () => {
      const next = !state
      setOptimistic(next)
      const result = await setWatching(postId, next)
      if (!result.ok) toast.error(result.error)
    })
  }

  return (
    <OutlineButton onClick={toggle} disabled={pending} aria-pressed={state} className="px-3 py-1 text-xs">
      {state ? 'Watching' : 'Watch'}
    </OutlineButton>
  )
}
