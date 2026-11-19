'use client'

import { useState, useTransition } from 'react'
import { updateComment } from '@/actions/comment-actions'
import { ArrowIcon, BrowseIcon, ElloQuickEmoji, XIcon, XIconLG } from '@/components/icons'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { commentSchema } from '@/lib/schemas/comment'
import { toast } from '@/stores/toast-store'
import type { Comment } from '@/types/post'
import { cn } from '@/utils/cn'
import { commentHtmlToText } from '@/utils/comment-text'
import editStyles from './comment-edit-form.module.css'
import barStyles from './comment-action-bar.module.css'
import styles from './comment-editor.module.css'
import commentStyles from './comments.module.css'

interface CommentEditFormProps {
  postId: string
  comment: Comment
  onSaved: () => void
  onCancel: () => void
}

/** The text of a comment's text regions, one paragraph per region. */
const textOf = (comment: Comment): string =>
  comment.content
    .flatMap((region) => (region.kind === 'text' ? [commentHtmlToText(region.data)] : []))
    .join('\n\n')

const imagesOf = (comment: Comment): { url: string; alt: string }[] =>
  comment.content.flatMap((region) =>
    region.kind === 'image' && region.data.url
      ? [{ url: region.data.url, alt: region.data.alt ?? '' }]
      : [],
  )

/**
 * The original's inline editor for an existing comment (`<Editor isComment comment>` with isEditing):
 * it replaces the comment body, shows the remove-content X while there is text and an Update button.
 */
export const CommentEditForm = ({ postId, comment, onSaved, onCancel }: CommentEditFormProps) => {
  const [pending, startTransition] = useTransition()
  const [text, setText] = useState(() => textOf(comment))
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const hasContent = text.trim().length > 0
  const inputId = `commentEditor${postId}_${comment.id}-body`

  const submit = (event: { preventDefault: () => void }): void => {
    event.preventDefault()
    const parsed = commentSchema.safeParse({ body: text })
    if (!parsed.success) return setError(parsed.error.issues[0]?.message ?? 'Invalid comment')
    setError(null)
    startTransition(async () => {
      const result = await updateComment(postId, comment.id, parsed.data.body, imagesOf(comment))
      if (!result.ok) return toast.error(result.error)
      onSaved()
    })
  }

  return (
    <form
      className={cn('editor withQuickEmoji isComment', styles.editor, hasContent && 'hasContent')}
      onSubmit={submit}
      noValidate
    >
      <div className={cn('editor-region', styles.region)}>
        <div className={cn('editor-block', styles.block)}>
          <label htmlFor={inputId} className="sr-only">
            Comment
          </label>
          <textarea
            id={inputId}
            className={cn('editable text', styles.editable)}
            rows={1}
            value={text}
            aria-invalid={!!error}
            onChange={(event) => setText(event.target.value)}
          />
          {hasContent ? (
            <div className={cn('RegionTools', editStyles.tools)}>
              <button
                type="button"
                aria-label="Remove"
                className={cn('BlockRemove', editStyles.remove)}
                onClick={() => setConfirming(true)}
              >
                <XIcon />
              </button>
            </div>
          ) : null}
        </div>
      </div>
      <div className={styles.emoji}>
        <button
          type="button"
          aria-label="Add emoji"
          onClick={() => toast.info('Emoji shortcuts are not available yet')}
        >
          <ElloQuickEmoji />
        </button>
      </div>
      <div className={barStyles.bar} id={`commentEditor${postId}_${comment.id}`}>
        <div className={barStyles.left}>
          <button
            type="button"
            className={cn('PostActionButton isComment forUpload', barStyles.button)}
            aria-label="Upload"
            onClick={() => toast.info('Image uploads in comments are not available yet')}
          >
            <span className={barStyles.label}>Upload</span>
            <BrowseIcon />
          </button>
          <button
            type="button"
            className={cn(
              'PostActionButton isComment forCancel icon-text',
              barStyles.button,
              barStyles.cancelIcon,
            )}
            aria-label="Cancel"
            onClick={onCancel}
          >
            <span className={barStyles.label}>Cancel</span>
            <XIconLG />
          </button>
        </div>
        <div className={barStyles.right}>
          <button
            type="button"
            className={cn('PostActionButton isComment forCancel label', barStyles.cancelText)}
            onClick={onCancel}
          >
            <span>Cancel</span>
          </button>
          <button
            type="submit"
            className={cn(
              'PostActionButton isComment forSubmit forUpdate',
              barStyles.button,
              barStyles.submit,
            )}
            disabled={!hasContent || pending}
            aria-label="Update"
          >
            <span className={barStyles.label}>Update</span>
            <ArrowIcon />
          </button>
        </div>
      </div>
      {error ? (
        <p role="alert" className={commentStyles.error}>
          {error}
        </p>
      ) : null}
      {confirming ? (
        <ConfirmDialog
          title="Remove this content?"
          onConfirm={() => {
            setConfirming(false)
            setText('')
          }}
          onDismiss={() => setConfirming(false)}
        />
      ) : null}
    </form>
  )
}
