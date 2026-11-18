'use client'

import { useState } from 'react'
import { CheckIconLG } from '@/components/icons'
import { FormControl } from '@/components/ui/form-control'
import { DismissButton } from '@/components/ui/dismiss-button'
import { Modal, ModalDialog } from '@/components/ui/modal'
import { cn } from '@/utils/cn'
import styles from './message-dialogs.module.css'

interface MessageDialogProps {
  name: string
  /** "Collaborate with" or "Hire". */
  titlePrefix: string
  /** Resolves with an error message, or null when the message went out. */
  onSend: (message: string) => Promise<string | null>
  onDismiss: () => void
}

/** The original's `MessageDialog`: compose a message to a user (Collab / Hire), then "Email sent". */
export const MessageDialog = ({ name, titlePrefix, onSend, onDismiss }: MessageDialogProps) => {
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const send = async (): Promise<void> => {
    const failure = await onSend(message)
    if (failure) setError(failure)
    else setSent(true)
  }

  if (sent) {
    return (
      <Modal label={`Email sent to ${name}`} onDismiss={onDismiss}>
        <ModalDialog className={styles.messageDialog}>
          <h2 className={styles.messageHeading}>
            <CheckIconLG />
            <span>{`Email sent to ${name}`}</span>
          </h2>
          <button type="button" className={cn(styles.messageButton, styles.sentOkay)} onClick={onDismiss}>
            Okay
          </button>
          <DismissButton onClick={onDismiss} />
        </ModalDialog>
      </Modal>
    )
  }

  return (
    <Modal label={`${titlePrefix} ${name}`} onDismiss={onDismiss}>
      <ModalDialog className={styles.messageDialog}>
        <h2 className={styles.messageHeading}>{`${titlePrefix} ${name}`}</h2>
        <form
          id="MessageForm"
          className="MessageForm"
          noValidate
          onSubmit={(e) => {
            e.preventDefault()
            if (message.trim()) void send()
          }}
        >
          <FormControl appearance="box" className="MessageMessageControl">
            <FormControl.Label htmlFor="message">Message</FormControl.Label>
            <FormControl.Textarea
              id="message"
              className={cn('MessageMessageControl', styles.messageControl)}
              name="message"
              placeholder="Message"
              tabIndex={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </FormControl>
        </form>
        {error ? <p role="alert">{error}</p> : null}
        <button
          type="button"
          className={cn(styles.messageButton, styles.confirm)}
          disabled={!message.trim()}
          onClick={() => void send()}
        >
          Submit
        </button>
        <button type="button" className={styles.messageButton} onClick={onDismiss}>
          Cancel
        </button>
        <DismissButton onClick={onDismiss} />
      </ModalDialog>
    </Modal>
  )
}
