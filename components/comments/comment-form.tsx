'use client'

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
  type DragEvent,
  type FormEvent,
} from 'react'
import { createCommentFromBlocks, type CommentRegionInput } from '@/actions/comment-post-actions'
import { fetchCommenterUsernames } from '@/actions/comment-actions'
import { COMMENT_MAX_LENGTH } from '@/lib/schemas/comment'
import { toast } from '@/stores/toast-store'
import { cn } from '@/utils/cn'
import { CommentFormBar } from './comment-form-bar'
import { CommentImageBlock } from './comment-image-block'
import { CommentQuickEmoji } from './comment-quick-emoji'
import { CommentRegionTools } from './comment-region-tools'
import { CommentTextBlock } from './comment-text-block'
import { EmojiCompleter } from './emoji-completer'
import {
  canPostComment,
  hasCommentContent,
  hasUploadsInFlight,
  useCommentBlocks,
  type CommentBlock,
} from './use-comment-blocks'
import { useCommentUploads } from './use-comment-uploads'
import { useEmojiCompleter } from './use-emoji-completer'
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

const regionsOf = (blocks: CommentBlock[]): CommentRegionInput[] =>
  blocks.flatMap((block): CommentRegionInput[] => {
    if (block.kind === 'image') return block.url ? [{ kind: 'image', url: block.url }] : []
    return block.text.trim() ? [{ kind: 'text', text: block.text }] : []
  })

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
  const [hasDragOver, setDragOver] = useState(false)
  const store = useCommentBlocks()
  const { blocks, setText, appendText, addImage, updateImage, remove, move, reset } = store
  const fields = useRef(new Map<string, HTMLTextAreaElement>())
  const uploads = useCommentUploads({ addImage, updateImage })

  const hasContent = hasCommentContent(blocks)
  const text = blocks.flatMap((b) => (b.kind === 'text' ? [b.text.trim()] : [])).join('\n\n')
  const tooLong = text.length > COMMENT_MAX_LENGTH
  const canSubmit = canPostComment(blocks) && !tooLong && !pending && !hasUploadsInFlight(blocks)
  // The original shows the quick emoji only while the first block is text.
  const showQuickEmoji = blocks[0]?.kind === 'text'

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

  useEffect(() => {
    if (!reply) return
    const target = lastText(blocks)
    if (!target) return
    setText(target.id, `@${reply.username} `)
    fields.current.get(target.id)?.focus()
    // only a new reply request (not every keystroke) should rewrite the text
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reply])

  const clear = (): void => {
    blocks.forEach((b) => b.kind === 'image' && uploads.forget(b.id))
    uploads.releasePreviews()
    completer.hide()
    reset()
  }

  const onSubmit = (e: FormEvent): void => {
    e.preventDefault()
    if (!canSubmit) return
    startTransition(async () => {
      const result = await createCommentFromBlocks(postId, regionsOf(blocks))
      if (!result.ok) return toast.error(result.error)
      clear()
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
    clear()
    onCancel?.()
  }

  const onDrop = (e: DragEvent): void => {
    e.preventDefault()
    setDragOver(false)
    uploads.addFiles(Array.from(e.dataTransfer.files))
  }

  return (
    <form
      className={cn(
        'editor isComment',
        showQuickEmoji && 'withQuickEmoji',
        styles.editor,
        hasContent && 'hasContent',
        hasDragOver && 'hasDragOver',
      )}
      data-placeholder="Comment..."
      onSubmit={onSubmit}
      onDragOver={(e) => {
        e.preventDefault()
        setDragOver(true)
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
      noValidate
    >
      <div className={cn('editor-region', styles.region)} data-num-blocks={blocks.length}>
        {blocks.map((block, index) => (
          <div key={block.id} className={cn('editor-block', styles.block)} data-block-id={block.id}>
            {block.kind === 'text' ? (
              <CommentTextBlock
                block={block}
                inputId={`commentEditor${postId}-body${index === 0 ? '' : `-${index}`}`}
                label={index === 0 ? 'Comment' : `Comment, part ${index + 1}`}
                fieldRef={(node) => {
                  if (node) fields.current.set(block.id, node)
                  else fields.current.delete(block.id)
                }}
                invalid={tooLong}
                onChange={setText}
                onKeyUp={completer.onKeyUp}
                onKeyDown={completer.onKeyDown}
              />
            ) : (
              <CommentImageBlock block={block} onRetry={uploads.retry} />
            )}
            <CommentRegionTools
              id={block.id}
              onRemove={(id) => {
                uploads.forget(id)
                remove(id)
              }}
              onMove={move}
            />
          </div>
        ))}
      </div>
      {showQuickEmoji ? <CommentQuickEmoji onAddEmoji={appendText} /> : null}
      <CommentFormBar
        id={`commentEditor${postId}`}
        hasContent={hasContent}
        canSubmit={canSubmit}
        showReplyAll={showReplyAll}
        onFiles={uploads.addFiles}
        onReplyAll={replyAll}
        onCancel={cancel}
      />
      {tooLong ? (
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
