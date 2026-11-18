'use client'

import { useRouter } from 'next/navigation'
import { GreenXLRoundedRect } from '@/components/ui/rounded-rect'
import { useComposerStore } from '@/stores/composer-store'

interface SubmitButtonProps {
  isLoggedIn: boolean
  /** Text the invite wants at the top of a submission (usually its hashtag). */
  bodyBlock: string
}

/** SUBMIT: opens the composer prefilled for the invite, or sends visitors to sign up first. */
export const SubmitButton = ({ isLoggedIn, bodyBlock }: SubmitButtonProps) => {
  const router = useRouter()
  const onClick = (): void => {
    if (!isLoggedIn) {
      router.push('/join')
      return
    }
    const store = useComposerStore.getState()
    store.open()
    const text = useComposerStore.getState().blocks.find((block) => block.kind === 'text')
    if (text) store.setText(text.id, bodyBlock)
    window.scrollTo({ top: 0 })
  }
  return (
    <GreenXLRoundedRect className="SubmitButton" onClick={onClick}>
      SUBMIT
    </GreenXLRoundedRect>
  )
}
