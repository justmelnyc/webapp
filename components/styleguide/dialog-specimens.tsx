'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { DismissButton } from '@/components/ui/dismiss-button'
import { ModalButton, ModalDialog, ModalHeading } from '@/components/ui/modal'
import { toast } from '@/stores/toast-store'
import { DangerStage, Inline, ModalStage, Specimen, Stage, Variant, dismissStage } from './specimen'

/** Dialog chrome: the modal parts (drawn in place on the scrim colours), a live ConfirmDialog and the toasts. */
export const DialogSpecimens = () => {
  const [open, setOpen] = useState(false)
  const [answer, setAnswer] = useState('')
  return (
    <>
      <Specimen name="Modal, ModalDialog, ModalHeading, ModalButton" about="Modal is the full screen scrim (Escape or a click on it dismisses); the dialog, heading and white pill buttons go inside. Pass dangerZone as its className for the red scrim of destructive actions.">
        <Variant label="ModalDialog, ModalHeading, ModalButton">
          <ModalStage>
            <ModalDialog>
              <ModalHeading>Delete Post?</ModalHeading>
              <ModalButton>Yes</ModalButton>
              <ModalButton>No</ModalButton>
            </ModalDialog>
          </ModalStage>
        </Variant>
        <Variant label="On the danger zone scrim">
          <DangerStage>
            <ModalDialog>
              <ModalHeading>Delete Account?</ModalHeading>
              <ModalButton>Yes</ModalButton>
              <ModalButton>No</ModalButton>
            </ModalDialog>
          </DangerStage>
        </Variant>
      </Specimen>
      <Specimen name="ConfirmDialog" about="A question with Yes and No on a Modal. The whole thing in one component.">
        <Variant label={answer ? `You said ${answer}` : 'Live'}>
          <Stage>
            <Button onClick={() => setOpen(true)}>Open it</Button>
          </Stage>
        </Variant>
      </Specimen>
      <Specimen name="DismissButton" about="The X in the top right corner of a dialog (5px in, 10px from 40em). It positions itself against the nearest positioned ancestor.">
        <Variant label="On a white dialog">
          <Stage className={dismissStage}>
            <DismissButton onClick={() => undefined} />
          </Stage>
        </Variant>
        <Variant label="On the scrim">
          <ModalStage className={dismissStage}>
            <DismissButton onClick={() => undefined} />
          </ModalStage>
        </Variant>
      </Specimen>
      <Specimen name="Toaster (toast.error, toast.success, toast.info)" about="The original's black Alert across the top of the page. It is mounted once for the app; raise one from anywhere with the toast helpers of stores/toast-store.">
        <Variant label="Live">
          <Stage>
            <Inline>
              <Button onClick={() => toast.info('Saved.')}>A message</Button>
              <Button onClick={() => toast.error('Please try again in a minute.', 'Something went wrong')}>With a title</Button>
            </Inline>
          </Stage>
        </Variant>
      </Specimen>
      {open ? (
        <ConfirmDialog
          title="Delete Post?"
          onConfirm={() => {
            setAnswer('Yes')
            setOpen(false)
          }}
          onDismiss={() => {
            setAnswer('No')
            setOpen(false)
          }}
        />
      ) : null}
    </>
  )
}
