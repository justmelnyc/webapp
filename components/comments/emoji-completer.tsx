'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/utils/cn'
import type { EmojiCompleterState } from './use-emoji-completer'
import styles from './emoji-completer.module.css'

interface EmojiCompleterProps {
  state: EmojiCompleterState | null
  onPick: (name: string) => void
  onClose: () => void
}

/** The original's `Completer` for emoji: a dark list under the word being typed. */
export const EmojiCompleter = ({ state, onPick, onClose }: EmojiCompleterProps) => {
  const isOpen = !!state && state.suggestions.length > 0

  // The original hides the completer on any mouseup outside its own buttons.
  useEffect(() => {
    if (!isOpen) return
    const onMouseUp = (e: MouseEvent): void => {
      if (e.target instanceof Element && e.target.closest('.Completion')) return
      onClose()
    }
    document.addEventListener('mouseup', onMouseUp)
    return () => document.removeEventListener('mouseup', onMouseUp)
  }, [isOpen, onClose])

  if (!state || !isOpen) return null
  return createPortal(
    <div className={cn('Popovers', styles.popovers)}>
      <div
        className={styles.completer}
        // the original's `deviceSize === 'mobile'` (under 640px) only sets the top
        style={window.innerWidth < 640 ? { top: state.top } : { top: state.top, left: state.left }}
        // keep the caret in the textarea while a suggestion is clicked
        onMouseDown={(e) => e.preventDefault()}
      >
        {state.suggestions.map((emoji, index) => (
          <button
            key={emoji.name}
            type="button"
            className={cn(
              'Completion EmojiCompletion',
              index === state.selected && 'isActive',
              styles.completion,
            )}
            onClick={() => onPick(emoji.name)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- the original's plain 20px emoji image */}
            <img
              className={styles.emoji}
              src={emoji.imageUrl}
              alt="ello"
              title="ello"
              width={20}
              height={20}
            />
            <span className={styles.label}>{`:${emoji.name}:`}</span>
          </button>
        ))}
      </div>
    </div>,
    document.body,
  )
}
