'use client'

import { useEffect, type KeyboardEvent, type Ref } from 'react'
import { cn } from '@/utils/cn'
import type { CommentTextBlock as CommentTextBlockData } from './use-comment-blocks'
import styles from './comment-editor.module.css'

interface CommentTextBlockProps {
  block: CommentTextBlockData
  inputId: string
  /** Only the first block carries the visible label for assistive tech; the rest are labelled by position. */
  label: string
  fieldRef: Ref<HTMLTextAreaElement>
  invalid: boolean
  onChange: (id: string, text: string) => void
  onKeyUp: (id: string, e: KeyboardEvent<HTMLTextAreaElement>) => void
  onKeyDown: (e: KeyboardEvent<HTMLTextAreaElement>) => void
}

/** A text block of the comment editor (the original's TextBlock; a textarea here, so the form can read it). */
export const CommentTextBlock = ({
  block,
  inputId,
  label,
  fieldRef,
  invalid,
  onChange,
  onKeyUp,
  onKeyDown,
}: CommentTextBlockProps) => {
  // The original marks the body while a text block has focus (the phone footer hides meanwhile).
  useEffect(
    () => () => {
      // another text block of the editor may still hold the focus
      const active = document.activeElement
      if (!(active instanceof HTMLElement && active.classList.contains('text'))) {
        document.body.classList.remove('isEditorFocused')
      }
    },
    [],
  )
  return (
    <>
      <label htmlFor={inputId} className="sr-only">
        {label}
      </label>
      <textarea
        id={inputId}
        ref={fieldRef}
        className={cn('editable text', styles.editable)}
        rows={1}
        value={block.text}
        aria-invalid={invalid}
        onChange={(e) => onChange(block.id, e.target.value)}
        onKeyUp={(e) => onKeyUp(block.id, e)}
        onKeyDown={onKeyDown}
        onFocus={() => document.body.classList.add('isEditorFocused')}
        onBlur={() => document.body.classList.remove('isEditorFocused')}
      />
    </>
  )
}
