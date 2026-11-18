'use client'

import { Modal, ModalButton, ModalDialog, ModalHeading } from '@/components/ui/modal'

interface ConfirmDialogProps {
  title: string
  onConfirm: () => void
  onDismiss: () => void
}

/** The original's `ConfirmDialog`: a heading with Yes / No buttons on the modal scrim. */
export const ConfirmDialog = ({ title, onConfirm, onDismiss }: ConfirmDialogProps) => (
  <Modal label={title} onDismiss={onDismiss}>
    <ModalDialog className="w-auto">
      <ModalHeading>{title}</ModalHeading>
      <ModalButton onClick={onConfirm}>Yes</ModalButton>
      <ModalButton onClick={onDismiss}>No</ModalButton>
    </ModalDialog>
  </Modal>
)
