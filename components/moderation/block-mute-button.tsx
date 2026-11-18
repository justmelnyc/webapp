'use client'

import { DotsIcon } from '@/components/icons'
import { Hint } from '@/components/posts/hint'
import { useBlockMute } from '@/components/moderation/use-block-mute'
import { cn } from '@/utils/cn'
import styles from './block-mute-button.module.css'

interface BlockMuteButtonProps {
  userId: string
  username: string
  priority: string | null | undefined
}

/** The dots in a profile's name block (`BlockMuteButton.inUserProfile`): opens the block / mute / flag dialog. */
export const BlockMuteButton = ({ userId, username, priority }: BlockMuteButtonProps) => {
  const { priority: shown, open, dialogs } = useBlockMute({ userId, username, priority })
  return (
    <div className={cn('RelationshipContainer inUserProfile', styles.container)} data-priority={shown}>
      <button type="button" className={cn('BlockMuteButton inUserProfile', styles.button)} onClick={open}>
        <DotsIcon />
        <Hint>Block, Mute or Flag</Hint>
      </button>
      {dialogs}
    </div>
  )
}
