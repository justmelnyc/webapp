'use client'

import { useState } from 'react'
import { FLAG_CHOICES, type FlagKind } from '@/lib/schemas/moderation'
import { useMediaQuery } from '@/components/layout/use-media-query'
import { DismissButton } from '@/components/ui/dismiss-button'
import { Modal, ModalDialog } from '@/components/ui/modal'
import { cn } from '@/utils/cn'
import styles from './moderation-dialogs.module.css'

interface FlagDialogProps {
  /** Resolves with an error message, or null when the report was accepted. */
  onSubmit: (kind: FlagKind) => Promise<string | null>
  onDismiss: () => void
}

/** The original's offsets for the Submit button, by device size (`OFFSETS` in FlagDialog.js). */
const useSubmitOffset = (): number => {
  const desktop = useMediaQuery('(min-width: 60em)')
  const tablet = useMediaQuery('(min-width: 40em)')
  if (desktop) return 100
  return tablet ? 80 : 70
}

const Thanks = ({ onDismiss }: { onDismiss: () => void }) => (
  <Modal label="Thank you" onDismiss={onDismiss}>
    <ModalDialog className={styles.flagDialog}>
      <h2 className={styles.flagHeading}>Thank you.</h2>
      <p>You may temporarily still see this content. You may want to block or mute this user as well.</p>
      <div>
        <button type="button" className={cn(styles.flagButton, styles.choice, styles.okay)} onClick={onDismiss}>
          Okay
        </button>
      </div>
      <DismissButton onClick={onDismiss} />
    </ModalDialog>
  </Modal>
)

/** The original's `FlagDialog`: pick a reason (the Submit button rides next to it), then a thank you. */
export const FlagDialog = ({ onSubmit, onDismiss }: FlagDialogProps) => {
  const [choice, setChoice] = useState<FlagKind | null>(null)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const offset = useSubmitOffset()
  const index = FLAG_CHOICES.findIndex(([kind]) => kind === choice)

  if (sent) return <Thanks onDismiss={onDismiss} />

  const submit = async (): Promise<void> => {
    if (!choice) return
    const failure = await onSubmit(choice)
    if (failure) setError(failure)
    else setSent(true)
  }

  return (
    <Modal label="Flag this content" onDismiss={onDismiss}>
      <ModalDialog className={styles.flagDialog}>
        <h2 className={styles.flagHeading}>Would you like to flag this content as:</h2>
        <div>
          {FLAG_CHOICES.map(([kind, label]) => (
            <button
              key={kind}
              type="button"
              className={cn(styles.flagButton, styles.choice, choice === kind && styles.active)}
              onClick={() => setChoice(choice === kind ? null : kind)}
            >
              {label}
            </button>
          ))}
          <button
            type="button"
            className={cn(styles.flagButton, styles.submit)}
            style={index < 0 ? { display: 'none' } : { top: 70 * index + offset, display: 'inline-block' }}
            onClick={submit}
          >
            Submit
          </button>
        </div>
        {error ? <p role="alert">{error}</p> : null}
        <p className={styles.flagFootnote}>
          Ello allows adult content as long as it complies with our rules and is marked NSFW. You may temporarily still
          see this content. You may want to block or mute this user as well.
        </p>
        <DismissButton onClick={onDismiss} />
      </ModalDialog>
    </Modal>
  )
}
