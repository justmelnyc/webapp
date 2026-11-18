'use client'

import { useEffect, useState } from 'react'
import { dangerZone, Modal, ModalButton, ModalDialog, ModalHeading } from '@/components/ui/modal'
import { cn } from '@/utils/cn'
import styles from './settings-dialogs.module.css'

interface DeleteAccountDialogProps {
  onConfirm: () => void
  onDismiss: () => void
}

type Scene = 'confirm' | 'confirmReally' | 'countdown'

const COUNTDOWN_SECONDS = 5

/** The original's `DeleteAccountDialog`: two confirmations, then a five second countdown you can cancel. */
export const DeleteAccountDialog = ({ onConfirm, onDismiss }: DeleteAccountDialogProps) => {
  const [scene, setScene] = useState<Scene>('confirm')
  const [counter, setCounter] = useState(COUNTDOWN_SECONDS)

  useEffect(() => {
    if (scene !== 'countdown') return
    const interval = setInterval(() => setCounter((value) => value - 1), 1000)
    return () => clearInterval(interval)
  }, [scene])

  useEffect(() => {
    if (scene === 'countdown' && counter === 0) onConfirm()
  }, [scene, counter, onConfirm])

  return (
    <Modal label="Delete account" className={cn('isDangerZone', dangerZone)} onDismiss={onDismiss}>
      <ModalDialog className={cn(styles.deleteDialog)}>
        {scene === 'confirm' ? (
          <>
            <ModalHeading>Delete account?</ModalHeading>
            <ModalButton onClick={() => setScene('confirmReally')}>Yes</ModalButton>
            <ModalButton onClick={onDismiss}>No</ModalButton>
          </>
        ) : null}
        {scene === 'confirmReally' ? (
          <>
            <ModalHeading>Are you sure?</ModalHeading>
            <ModalButton onClick={() => setScene('countdown')}>Yes</ModalButton>
            <ModalButton onClick={onDismiss}>No</ModalButton>
            <p className={styles.footnote}>
              * By deleting your account you remove your personal information from Ello. Your account cannot be
              restored.
            </p>
          </>
        ) : null}
        {scene === 'countdown' ? (
          <>
            <ModalHeading>
              <span>You will be redirected in </span>
              <span>{counter}</span>
              <span> ...</span>
            </ModalHeading>
            <ModalButton className={styles.cancel} onClick={onDismiss}>
              Cancel!
            </ModalButton>
          </>
        ) : null}
      </ModalDialog>
    </Modal>
  )
}
