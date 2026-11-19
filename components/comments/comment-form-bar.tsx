'use client'

import { useRef, type ChangeEvent } from 'react'
import { ArrowIcon, BrowseIcon, ReplyAllIcon, XIconLG } from '@/components/icons'
import { cn } from '@/utils/cn'
import styles from './comment-action-bar.module.css'

interface CommentFormBarProps {
  id: string
  hasContent: boolean
  canSubmit: boolean
  /** Posting a new comment, or saving an edited one (Update; no Reply All). */
  submitKind?: 'comment' | 'update'
  showReplyAll?: boolean
  onFiles: (files: File[]) => void
  onReplyAll?: () => void
  onCancel: () => void
}

/** The original's PostActionBar, comment version: Upload, Reply All, Cancel and Comment. */
export const CommentFormBar = ({
  id,
  hasContent,
  canSubmit,
  submitKind = 'comment',
  showReplyAll = false,
  onFiles,
  onReplyAll,
  onCancel,
}: CommentFormBarProps) => {
  const submitLabel = submitKind === 'update' ? 'Update' : 'Comment'
  const input = useRef<HTMLInputElement>(null)

  const onChange = (e: ChangeEvent<HTMLInputElement>): void => {
    onFiles(Array.from(e.target.files ?? []))
    e.target.value = '' // allow picking the same file again
  }

  return (
    <div className={styles.bar} id={id}>
      <div className={styles.left}>
        <button
          type="button"
          className={cn('PostActionButton isComment forUpload', styles.button)}
          aria-label="Upload"
          onClick={(e) => {
            e.currentTarget.blur()
            input.current?.click()
          }}
        >
          <span className={styles.label}>Upload</span>
          <BrowseIcon />
        </button>
        {showReplyAll ? (
          <button
            type="button"
            className={cn('PostActionButton isComment forReplyAll', styles.button)}
            aria-label="Reply All"
            onClick={onReplyAll}
          >
            <span className={styles.label}>Reply All</span>
            <ReplyAllIcon />
          </button>
        ) : null}
        <button
          type="button"
          className={cn(
            'PostActionButton isComment forCancel icon-text',
            styles.button,
            styles.cancelIcon,
          )}
          disabled={!hasContent}
          aria-label="Cancel"
          onClick={onCancel}
        >
          <span className={styles.label}>Cancel</span>
          <XIconLG />
        </button>
      </div>
      <div className={styles.right}>
        <button
          type="button"
          className={cn('PostActionButton isComment forCancel label', styles.cancelText)}
          onClick={onCancel}
        >
          <span>Cancel</span>
        </button>
        <button
          type="submit"
          className={cn(
            `PostActionButton isComment forSubmit ${submitKind === 'update' ? 'forUpdate' : 'forComment'}`,
            styles.button,
            styles.submit,
          )}
          disabled={!canSubmit}
          aria-label={submitLabel}
        >
          <span className={styles.label}>{submitLabel}</span>
          <ArrowIcon />
        </button>
      </div>
      <input
        ref={input}
        type="file"
        accept="image/*"
        multiple
        hidden
        aria-label="Choose images"
        onChange={onChange}
      />
    </div>
  )
}
