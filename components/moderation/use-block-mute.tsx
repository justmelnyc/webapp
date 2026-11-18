'use client'

import { useRouter } from 'next/navigation'
import { useOptimistic, useState, useTransition, type ReactNode } from 'react'
import { flagUser, setRelationship } from '@/actions/moderation-actions'
import { BlockMuteDialog } from '@/components/moderation/block-mute-dialog'
import { FlagDialog } from '@/components/moderation/flag-dialog'
import { toast } from '@/stores/toast-store'
import { getNextBlockMutePriority } from '@/utils/relationship'

interface BlockMuteArgs {
  userId: string
  username: string
  priority: string | null | undefined
}

interface BlockMute {
  /** The viewer's relationship with the user, including a change that is still saving. */
  priority: string | null | undefined
  open: () => void
  /** Render this next to the control that calls `open`. */
  dialogs: ReactNode
}

type Step = 'closed' | 'choose' | 'flag'

/** RelationshipContainer's block / mute / flag flow, shared by the Blocked pill and the dots button. */
export const useBlockMute = ({ userId, username, priority }: BlockMuteArgs): BlockMute => {
  const router = useRouter()
  const [step, setStep] = useState<Step>('closed')
  const [shown, setShown] = useOptimistic<string | null | undefined, string>(priority, (_, next) => next)
  const [, startTransition] = useTransition()
  const close = (): void => setStep('closed')

  const choose = (requested: 'block' | 'mute'): void => {
    const next = getNextBlockMutePriority(shown, requested)
    const wasBlocked = shown === 'block'
    close()
    startTransition(async () => {
      setShown(next)
      const result = await setRelationship(userId, next)
      if (!result.ok) return void toast.error(result.error)
      // A fresh block leaves the profile, like the original's `replace(previousPath || '/')`.
      if (requested === 'block' && !wasBlocked) router.replace('/')
    })
  }

  const report = async (kind: string): Promise<string | null> => {
    const result = await flagUser(username, kind)
    return result.ok ? null : result.error
  }

  const dialogs =
    step === 'choose' ? (
      <BlockMuteDialog
        username={username}
        isBlockActive={shown === 'block'}
        isMuteActive={shown === 'mute'}
        onBlock={() => choose('block')}
        onMute={() => choose('mute')}
        onFlag={() => setStep('flag')}
        onDismiss={close}
      />
    ) : step === 'flag' ? (
      <FlagDialog onSubmit={report} onDismiss={close} />
    ) : null

  return { priority: shown, open: () => setStep('choose'), dialogs }
}
