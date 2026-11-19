'use client'

import { useCallback, useRef, useState, type DragEvent } from 'react'
import { COMMENT_MAX_LENGTH } from '@/lib/schemas/comment'
import {
  canPostComment,
  hasCommentContent,
  hasUploadsInFlight,
  useCommentBlocks,
  type CommentBlock,
} from './use-comment-blocks'
import { useCommentUploads } from './use-comment-uploads'
import { useEmojiCompleter } from './use-emoji-completer'

/**
 * Everything the new-comment form and the edit-in-place form share: the blocks, their textareas,
 * picture uploads, the `:` emoji completer and file dragging. Each form adds its own save/cancel.
 */
export const useCommentEditor = (initial?: CommentBlock[]) => {
  const [hasDragOver, setDragOver] = useState(false)
  const store = useCommentBlocks(initial)
  const { blocks, setText, addImage, updateImage, reset } = store
  const fields = useRef(new Map<string, HTMLTextAreaElement>())
  const uploads = useCommentUploads({ addImage, updateImage })

  const text = blocks.flatMap((b) => (b.kind === 'text' ? [b.text.trim()] : [])).join('\n\n')
  const tooLong = text.length > COMMENT_MAX_LENGTH

  const replaceText = useCallback(
    (id: string, next: string, caret: number): void => {
      setText(id, next)
      requestAnimationFrame(() => {
        const field = fields.current.get(id)
        field?.focus()
        field?.setSelectionRange(caret, caret)
      })
    },
    [setText],
  )
  const completer = useEmojiCompleter(replaceText)

  const clear = (): void => {
    blocks.forEach((b) => b.kind === 'image' && uploads.forget(b.id))
    uploads.releasePreviews()
    completer.hide()
    reset()
  }

  const dropHandlers = {
    onDragOver: (e: DragEvent): void => {
      e.preventDefault()
      setDragOver(true)
    },
    onDragLeave: (): void => setDragOver(false),
    onDrop: (e: DragEvent): void => {
      e.preventDefault()
      setDragOver(false)
      uploads.addFiles(Array.from(e.dataTransfer.files))
    },
  }

  return {
    ...store,
    fields,
    uploads,
    completer,
    clear,
    tooLong,
    hasDragOver,
    dropHandlers,
    hasContent: hasCommentContent(blocks),
    /** Something to post, nothing uploading or failed, and not over the limit. */
    isPostable: canPostComment(blocks) && !tooLong && !hasUploadsInFlight(blocks),
    // The original shows the quick emoji only while the first block is text.
    showQuickEmoji: blocks[0]?.kind === 'text',
  }
}

export type CommentEditor = ReturnType<typeof useCommentEditor>
