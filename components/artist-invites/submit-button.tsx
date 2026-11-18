'use client'

import { useRegistrationDialog } from '@/components/auth/registration-dialog'
import { GreenXLRoundedRect } from '@/components/ui/rounded-rect'
import { useComposerStore } from '@/stores/composer-store'

interface SubmitButtonProps {
  isLoggedIn: boolean
  invite: { id: string; title: string }
}

/** SUBMIT: opens the omnibar for this invite, or the sign-up dialog for visitors who are not logged in. */
export const SubmitButton = ({ isLoggedIn, invite }: SubmitButtonProps) => {
  const registration = useRegistrationDialog()
  const onClick = (): void => {
    if (!isLoggedIn) return registration.open('artist-invites')
    useComposerStore.getState().openForInvite({ id: invite.id, title: invite.title })
    window.scrollTo({ top: 0 })
  }
  return (
    <GreenXLRoundedRect className="SubmitButton" onClick={onClick}>
      SUBMIT
    </GreenXLRoundedRect>
  )
}
