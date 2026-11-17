'use client'

import { XIcon } from '@/components/icons'
import { Modal, ModalDialog } from '@/components/ui/modal'
import styles from './settings-dialogs.module.css'

interface AdultPostsDialogProps {
  onDismiss: () => void
}

/** The original's `AdultPostsDialog`, shown when "Post Adult Content" is switched on. */
export const AdultPostsDialog = ({ onDismiss }: AdultPostsDialogProps) => (
  <Modal label="Post Adult Content" onDismiss={onDismiss}>
    <ModalDialog className={styles.adultDialog}>
      <p className="mt-0!">If you post adult content, you must mark your account Not Safe for Work (NSFW).</p>
      <p>
        When you set &quot;Post Adult Content&quot; to yes, users who do not wish to view adult content will not see your
        posts.
      </p>
      <button type="button" className={styles.okay} onClick={onDismiss}>
        Okay
      </button>
      <button type="button" aria-label="Close" className={`CloseModal ${styles.dismiss}`} onClick={onDismiss}>
        <XIcon />
      </button>
    </ModalDialog>
  </Modal>
)
