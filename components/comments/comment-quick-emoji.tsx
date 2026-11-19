'use client'

import { useEffect, useState } from 'react'
import { ElloQuickEmoji } from '@/components/icons'
import { AssetOriginProvider, Emoji } from '@/components/ui/emoji'
import { cn } from '@/utils/cn'
import { useEmojiOrigin } from './emoji-set'
import styles from './comment-quick-emoji.module.css'

const OPTIONS = [
  '+1',
  'sparkles',
  'metal',
  'ok_hand',
  'v',
  'snowman',
  'heart',
  'panda_face',
  'clap',
  'boom',
  'star',
  'wave',
  'raised_hands',
  'dizzy',
  'sparkling_heart',
  'muscle',
  'fire',
  'fist',
  'ello',
  'bread',
]

/** lodash `sampleSize`: n distinct random items. */
export const sampleSize = <T,>(list: T[], n: number, random: () => number = Math.random): T[] => {
  const copy = [...list]
  const picked: T[] = []
  while (picked.length < n && copy.length > 0) {
    const [item] = copy.splice(Math.floor(random() * copy.length), 1)
    if (item !== undefined) picked.push(item)
  }
  return picked
}

interface CommentQuickEmojiProps {
  onAddEmoji: (code: string) => void
}

/** The original's QuickEmoji: a smiley that opens four random emoji to drop into the comment. */
export const CommentQuickEmoji = ({ onAddEmoji }: CommentQuickEmojiProps) => {
  const [choices, setChoices] = useState<string[] | null>(null)
  const origin = useEmojiOrigin()
  const isActive = choices !== null

  // Any click or touch elsewhere closes it. Registered after the opening click has finished bubbling.
  useEffect(() => {
    if (!isActive) return
    const close = (): void => setChoices(null)
    const timer = window.setTimeout(() => {
      document.addEventListener('click', close)
      document.addEventListener('touchstart', close)
    }, 0)
    return () => {
      window.clearTimeout(timer)
      document.removeEventListener('click', close)
      document.removeEventListener('touchstart', close)
    }
  }, [isActive])

  if (choices) {
    return (
      <div className={cn(styles.wrapper, styles.isActive)}>
        <div className={styles.list}>
          {choices.map((name) => (
            <button
              key={name}
              type="button"
              className={styles.choice}
              name={name}
              onClick={() => {
                onAddEmoji(`:${name}:`)
                setChoices(null)
              }}
            >
              <AssetOriginProvider value={origin}>
                <Emoji name={name} />
              </AssetOriginProvider>
            </button>
          ))}
        </div>
      </div>
    )
  }
  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        aria-label="Add emoji"
        className={styles.toggle}
        onClick={() => setChoices(sampleSize(OPTIONS, 4))}
      >
        <ElloQuickEmoji />
      </button>
      <div className={styles.list} />
    </div>
  )
}
