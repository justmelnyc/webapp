'use client'

import { DismissButton } from '@/components/ui/dismiss-button'
import { Modal } from '@/components/ui/modal'
import { SHORTCUT_KEYS } from '@/constants/shortcut-keys'
import styles from './help-dialog.module.css'

/** The rows of the original's HelpDialog, in its order. */
const ROWS = [
  [SHORTCUT_KEYS.EDITORIAL, 'Navigate to editorial'],
  [SHORTCUT_KEYS.ARTIST_INVITES, 'Navigate to artist invites'],
  [SHORTCUT_KEYS.DISCOVER, 'Navigate to discover'],
  [SHORTCUT_KEYS.SEARCH, 'Navigate to search'],
  [SHORTCUT_KEYS.FOLLOWING, 'Navigate to following'],
  [SHORTCUT_KEYS.NOTIFICATIONS, 'View notifications'],
  [SHORTCUT_KEYS.TOGGLE_LAYOUT, 'Toggle grid mode for main content'],
  [SHORTCUT_KEYS.OMNIBAR, 'Focus post editor'],
  ['ESC', 'Close modal or alerts'],
  [SHORTCUT_KEYS.FULLSCREEN, 'Toggle fullscreen within a post editor'],
  [SHORTCUT_KEYS.DT_GRID_TOGGLE, 'Toggle layout grid'],
  [SHORTCUT_KEYS.DT_GRID_CYCLE, 'Toggle between horizontal and vertical grid'],
  [SHORTCUT_KEYS.HELP, 'Show this help modal'],
] as const

/** The original's `HelpDialog`: the "Key Commands" list opened with `?`. */
export const HelpDialog = ({ onDismiss }: { onDismiss: () => void }) => (
  <Modal label="Key Commands" onDismiss={onDismiss}>
    <div className={styles.dialog}>
      <h2 className={styles.heading}>Key Commands</h2>
      {ROWS.map(([keys, label]) => (
        <p key={keys} className={styles.row}>
          <span className={styles.key}>{keys}</span> {label}
        </p>
      ))}
      <DismissButton onClick={onDismiss} />
    </div>
  </Modal>
)
