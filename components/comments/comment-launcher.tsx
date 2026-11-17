'use client'

import { Avatar } from '@/components/ui/avatar'
import styles from './comment-launcher.module.css'

interface CommentLauncherProps {
  avatar: string | null
  username: string
  onLaunch: () => void
}

/** The original's `LaunchMobileCommentEditorButton`: shown below 60em until the viewer taps it. */
export const CommentLauncher = ({ avatar, username, onLaunch }: CommentLauncherProps) => (
  <div className={styles.launcher}>
    <Avatar src={avatar} name={username} />
    <button type="button" className={styles.launcherButton} onClick={onLaunch}>
      Comment...
    </button>
  </div>
)
