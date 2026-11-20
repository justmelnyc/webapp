'use client'

import { useState, useTransition, type FormEvent } from 'react'
import { updateComment } from '@/actions/comment-actions'
import { COMMENT_MAX_LENGTH } from '@/lib/schemas/comment'
import { toast } from '@/stores/toast-store'
import type { Comment } from '@/types/post'
import { cn } from '@/utils/cn'
import { CommentBlocksRegion } from './comment-blocks-region'
import { blocksOfComment, regionsOfBlocks } from './comment-edit-blocks'
import { CommentFormBar } from './comment-form-bar'
import { CommentQuickEmoji } from './comment-quick-emoji'
import { EmojiCompleter } from './emoji-completer'
import { useCommentEditor } from './use-comment-editor'
import parts from '@/components/ui/editor-parts.module.css'
import styles from './comment-editor.module.css'

interface CommentEditFormProps {
  postId: string
  comment: Comment
  onSaved: () => void
  onCancel: () => void
}

/**
 * The original's inline editor for an existing comment (`<Editor isComment comment>` while editing):
 * the same block editor as a new comment, pre-filled with the comment's text and picture regions,
 * saved with Update.
 */
export const CommentEditForm = ({ postId, comment, onSaved, onCancel }: CommentEditFormProps) => {
  const [pending, startTransition] = useTransition()
  const [initial] = useState(() => blocksOfComment(comment))
  const editor = useCommentEditor(initial)
  const { blocks, appendText, completer, uploads } = editor
  const editorId = `commentEditor${postId}_${comment.id}`

  const submit = (event: FormEvent): void => {
    event.preventDefault()
    if (!editor.isPostable || pending) return
    startTransition(async () => {
      const result = await updateComment(postId, comment.id, regionsOfBlocks(blocks))
      if (!result.ok) return toast.error(result.error)
      onSaved()
    })
  }

  return (
    <form
      className={cn(
        'editor isComment',
        editor.showQuickEmoji && 'withQuickEmoji',
        parts.placeholder,
        styles.editor,
        editor.hasContent && 'hasContent',
        editor.hasDragOver && 'hasDragOver',
      )}
      data-placeholder="Comment..."
      onSubmit={submit}
      {...editor.dropHandlers}
      noValidate
    >
      <CommentBlocksRegion editor={editor} idBase={editorId} />
      {editor.showQuickEmoji ? <CommentQuickEmoji onAddEmoji={appendText} /> : null}
      <CommentFormBar
        id={editorId}
        submitKind="update"
        hasContent={editor.hasContent}
        canSubmit={editor.isPostable && !pending}
        onFiles={uploads.addFiles}
        onCancel={onCancel}
      />
      {editor.tooLong ? (
        <p
          role="alert"
          className={styles.error}
        >{`Keep it under ${COMMENT_MAX_LENGTH} characters`}</p>
      ) : null}
      <EmojiCompleter
        state={completer.state}
        onPick={completer.complete}
        onClose={completer.hide}
      />
    </form>
  )
}
