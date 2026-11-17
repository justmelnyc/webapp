'use client'

import Link from 'next/link'
import { useOptimistic, useTransition } from 'react'
import { setFollowing } from '@/actions/relationship-actions'
import { OutlineButton, Button } from '@/components/ui/button'
import { toast } from '@/stores/toast-store'

interface FollowButtonProps {
  userId: string
  following: boolean
  signedIn: boolean
}

export const FollowButton = ({ userId, following, signedIn }: FollowButtonProps) => {
  const [state, setOptimistic] = useOptimistic<boolean, boolean>(following, (_, next) => next)
  const [pending, startTransition] = useTransition()

  const toggle = () => {
    if (!signedIn) return toast.info('Log in to follow people')
    startTransition(async () => {
      const next = !state
      setOptimistic(next)
      const result = await setFollowing(userId, next)
      if (!result.ok) toast.error(result.error)
    })
  }

  const Component = state ? OutlineButton : Button
  return (
    <Component onClick={toggle} disabled={pending} aria-pressed={state}>
      {state ? 'Following' : 'Follow'}
    </Component>
  )
}

export const EditProfileLink = () => (
  <Link href="/settings" className="border-stone hover:border-ink rounded-sm border px-4 py-2 text-sm">
    Edit profile
  </Link>
)
