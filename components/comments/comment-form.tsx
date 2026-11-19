'use client'

import { useEffect, useTransition, type FormEvent } from 'react'
import { createCommentFromBlocks } from '@/actions/comment-post-actions'
import { fetchCommenterUsernames } from '@/actions/comment-actions'
import { COMMENT_MAX_LENGTH } from '@/lib/schemas/comment'
import { toast } from '@/stores/toast-store'
import { cn } from '@/utils/cn'
import { CommentBlocksRegion } from './comment-blocks-region'
import { regionsOfBlocks } from './comment-edit-blocks'
import { CommentFormBar } from './comment-form-bar'
import { CommentQuickEmoji } from './comment-quick-emoji'
import { EmojiCompleter } from './emoji-completer'
import type { CommentBlock } from './use-comment-blocks'
import { useCommentEditor } from './use-comment-editor'
import styles from './comment-editor.module.css'

export interface ReplyRequest {
  username: string
  /** Changes with every click so replying to the same person twice still fires. */
  nonce: number
}

interface CommentFormProps {
  postId: string
  onCreated: () => void
  /** Called when the viewer cancels; the narrow layout closes the editor. */
  onCancel?: () => void
  reply?: ReplyRequest | null
  /** The original's `showReplyAll`: the post's owner, once it has comments, on wide viewports. */
  showReplyAll?: boolean
}

const lastText = (blocks: CommentBlock[]): CommentBlock | undefined =>
  blocks.findLast((b) => b.kind === 'text')

/** The original's comment editor: grey block, quick-emoji toggle, `:` completer, pictures and the PostActionBar. */
export const CommentForm = ({
  postId,
  onCreated,
  onCancel,
  reply,
  showReplyAll = false,
}: CommentFormProps) => {
  const [pending, startTransition] = useTransition()
  const editor = useCommentEditor()
  const { blocks, setText, appendText, fields, completer, uploads } = editor
  const canSubmit = editor.isPostable && !pending

  useEffect(() => {
    if (!reply) return
    const target = lastText(blocks)
    if (!target) return
    setText(target.id, `@${reply.username} `)
    fields.current.get(target.id)?.focus()
    // only a new reply request (not every keystroke) should rewrite the text
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reply])

  const onSubmit = (e: FormEvent): void => {
    e.preventDefault()
    if (!canSubmit) return
    startTransition(async () => {
      const result = await createCommentFromBlocks(postId, regionsOfBlocks(blocks))
      if (!result.ok) return toast.error(result.error)
      editor.clear()
      onCreated()
    })
  }

  // The original's `appendUsernames`: add every commenter's @username to the end, once.
  const replyAll = (): void => {
    startTransition(async () => {
      const result = await fetchCommenterUsernames(postId)
      if (!result.ok) return toast.error(result.error)
      const names = result.data.map((name) => `@${name} `).join('')
      const target = lastText(blocks)
      if (target?.kind === 'text' && !target.text.includes(names)) appendText(names)
    })
  }

  const cancel = (): void => {
    editor.clear()
    onCancel?.()
  }

  return (
    <form
      className={cn(
        'editor isComment',
        editor.showQuickEmoji && 'withQuickEmoji',
        styles.editor,
        editor.hasContent && 'hasContent',
        editor.hasDragOver && 'hasDragOver',
      )}
      data-placeholder="Comment..."
      onSubmit={onSubmit}
      {...editor.dropHandlers}
      noValidate
    >
      <CommentBlocksRegion editor={editor} idBase={`commentEditor${postId}`} />
      {editor.showQuickEmoji ? <CommentQuickEmoji onAddEmoji={appendText} /> : null}
      <CommentFormBar
        id={`commentEditor${postId}`}
        hasContent={editor.hasContent}
        canSubmit={canSubmit}
        showReplyAll={showReplyAll}
        onFiles={uploads.addFiles}
        onReplyAll={replyAll}
        onCancel={cancel}
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
