'use client'

import { DismissButton } from '@/components/ui/dismiss-button'
import { dangerZone, Modal, ModalDialog } from '@/components/ui/modal'
import { cn } from '@/utils/cn'
import styles from './moderation-dialogs.module.css'

interface BlockMuteDialogProps {
  username: string
  isBlockActive: boolean
  isMuteActive: boolean
  onBlock: () => void
  onMute: () => void
  onFlag: () => void
  onDismiss: () => void
}

interface ColumnProps {
  label: string
  active?: boolean
  sibling?: boolean
  onClick: () => void
  children: string
}

const Column = ({ label, active = false, sibling = false, onClick, children }: ColumnProps) => (
  <div className={cn(styles.column, sibling && styles.sibling)}>
    <button type="button" className={cn(styles.blockButton, active && styles.active)} onClick={onClick}>
      {label}
    </button>
    <p>{children}</p>
  </div>
)

/** The original's `BlockMuteDialog`: mute, block or flag a user, on the red `isDangerZone` scrim. */
export const BlockMuteDialog = ({
  username,
  isBlockActive,
  isMuteActive,
  onBlock,
  onMute,
  onFlag,
  onDismiss,
}: BlockMuteDialogProps) => (
  <Modal label="Mute, block or flag" onDismiss={onDismiss} className={dangerZone}>
    <ModalDialog className={styles.blockDialog}>
      <h2 className={styles.blockHeading}>{`Would you like to mute, block or flag @${username}?`}</h2>
      <div>
        <Column label={isMuteActive ? 'Unmute' : 'Mute'} active={isMuteActive} onClick={onMute}>
          Muting prevents further email notifications from a user and removes their past activity from your feed. The
          user is still able to follow you and can still comment on your posts, but you will not receive any
          notifications.
        </Column>
        <Column label={isBlockActive ? 'Unblock' : 'Block'} active={isBlockActive} sibling onClick={onBlock}>
          Blocking mutes a user, and disables them from viewing your profile and posts. When blocking, we recommend
          setting your account to &quot;Non-Public&quot; to disable your profile from being viewed by people outside of
          the Ello network.
        </Column>
        <Column label="Flag User" sibling onClick={onFlag}>
          {`Report @${username} for violating our rules.`}
        </Column>
      </div>
      <DismissButton onClick={onDismiss} />
    </ModalDialog>
  </Modal>
)
