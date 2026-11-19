'use client'

import { useEffect, useRef, useTransition } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createComment, fetchCommenterUsernames } from '@/actions/comment-actions'
import { ArrowIcon, BrowseIcon, ElloQuickEmoji, ReplyAllIcon, XIconLG } from '@/components/icons'
import { commentSchema, type CommentInput } from '@/lib/schemas/comment'
import { toast } from '@/stores/toast-store'
import { cn } from '@/utils/cn'
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

/** The original's comment editor: grey block, quick-emoji toggle and the PostActionBar. */
export const CommentForm = ({ postId, onCreated, onCancel, reply, showReplyAll = false }: CommentFormProps) => {
  const [pending, startTransition] = useTransition()
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<CommentInput>({ resolver: zodResolver(commentSchema), mode: 'onChange', defaultValues: { body: '' } })
  const { ref: registerRef, ...field } = register('body')
  const textarea = useRef<HTMLTextAreaElement | null>(null)
  const body = useWatch({ control, name: 'body' })
  const hasContent = (body ?? '').trim().length > 0

  useEffect(() => {
    if (!reply) return
    setValue('body', `@${reply.username} `, { shouldValidate: true })
    textarea.current?.focus()
  }, [reply, setValue])

  const onSubmit = (values: CommentInput): void => {
    startTransition(async () => {
      const result = await createComment(postId, values.body)
      if (!result.ok) return toast.error(result.error)
      reset()
      onCreated()
    })
  }

  // The original's `appendUsernames`: add every commenter's @username to the end, once.
  const replyAll = (): void => {
    startTransition(async () => {
      const result = await fetchCommenterUsernames(postId)
      if (!result.ok) return toast.error(result.error)
      const text = result.data.map((name) => `@${name} `).join('')
      const current = textarea.current?.value ?? ''
      if (!current.includes(text)) setValue('body', current + text, { shouldValidate: true })
    })
  }

  const cancel = (): void => {
    reset()
    onCancel?.()
  }

  return (
    <form className={cn('editor withQuickEmoji isComment', styles.editor, hasContent && 'hasContent')} data-placeholder="Comment..." onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className={cn('editor-region', styles.region)}>
        <div className={cn('editor-block', styles.block)}>
          <label htmlFor={`commentEditor${postId}-body`} className="sr-only">
            Comment
          </label>
          <textarea
            id={`commentEditor${postId}-body`}
            className={cn('editable text', styles.editable)}
            rows={1}
            aria-invalid={!!errors.body}
            {...field}
            ref={(node) => {
              registerRef(node)
              textarea.current = node
            }}
          />
        </div>
      </div>
      <div className={styles.emoji}>
        <button type="button" aria-label="Add emoji" onClick={() => toast.info('Emoji shortcuts are not available yet')}>
          <ElloQuickEmoji />
        </button>
      </div>
      <div className={styles.bar} id={`commentEditor${postId}`}>
        <div className={styles.left}>
          <button
            type="button"
            className={cn('PostActionButton isComment forUpload', styles.button)}
            aria-label="Upload"
            onClick={() => toast.info('Image uploads in comments are not available yet')}
          >
            <span className={styles.label}>Upload</span>
            <BrowseIcon />
          </button>
          {showReplyAll ? (
            <button
              type="button"
              className={cn('PostActionButton isComment forReplyAll', styles.button)}
              aria-label="Reply All"
              onClick={replyAll}
            >
              <span className={styles.label}>Reply All</span>
              <ReplyAllIcon />
            </button>
          ) : null}
          <button
            type="button"
            className={cn('PostActionButton isComment forCancel icon-text', styles.button, styles.cancelIcon)}
            disabled={!hasContent}
            aria-label="Cancel"
            onClick={cancel}
          >
            <span className={styles.label}>Cancel</span>
            <XIconLG />
          </button>
        </div>
        <div className={styles.right}>
          <button type="button" className={cn('PostActionButton isComment forCancel label', styles.cancelText)} onClick={cancel}>
            <span>Cancel</span>
          </button>
          <button
            type="submit"
            className={cn('PostActionButton isComment forSubmit forComment', styles.button, styles.submit)}
            disabled={!hasContent || pending}
            aria-label="Comment"
          >
            <span className={styles.label}>Comment</span>
            <ArrowIcon />
          </button>
        </div>
      </div>
      {errors.body?.message ? <p role="alert" className={styles.error}>{errors.body.message}</p> : null}
    </form>
  )
}
