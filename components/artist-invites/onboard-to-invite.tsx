'use client'

import { useEffect } from 'react'
import { useComposerStore } from '@/stores/composer-store'
import { useOnboardInviteStore } from '@/stores/onboard-invite-store'

interface OnboardToInviteProps {
  invite: { id: string; title: string }
}

/**
 * The end of SUBMIT -> sign up -> onboarding: when onboarding returned the new user to this invite,
 * open the omnibar for it once (the original's `isCompletingOnboarding` branch of `componentDidUpdate`).
 */
export const OnboardToInvite = ({ invite }: OnboardToInviteProps) => {
  const isCompleting = useOnboardInviteStore((state) => state.isCompleting)
  useEffect(() => {
    if (!isCompleting) return
    useComposerStore.getState().openForInvite({ id: invite.id, title: invite.title })
    window.scrollTo({ top: 0 })
    useOnboardInviteStore.getState().reset()
  }, [isCompleting, invite.id, invite.title])
  return null
}
