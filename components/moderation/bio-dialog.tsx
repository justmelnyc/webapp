'use client'

import { useMediaQuery } from '@/components/layout/use-media-query'
import { DismissButton } from '@/components/ui/dismiss-button'
import { Modal, ModalDialog } from '@/components/ui/modal'
import { cn } from '@/utils/cn'
import styles from './message-dialogs.module.css'

interface BioDialogProps {
  /** Already sanitised. */
  html: string
  onDismiss: () => void
}

/** The original's `TextMarkupDialog`, opened by a profile's See More button (centered on phones, `isFlex hasOverlay9`). */
export const BioDialog = ({ html, onDismiss }: BioDialogProps) => {
  const isMobile = useMediaQuery('(max-width: 39.9375em)')
  return (
    <Modal label="Bio" onDismiss={onDismiss} className={cn(styles.overlay9, isMobile && styles.flex)}>
      <ModalDialog className={styles.textDialog}>
        <div dangerouslySetInnerHTML={{ __html: html }} />
        <DismissButton onClick={onDismiss} />
      </ModalDialog>
    </Modal>
  )
}
