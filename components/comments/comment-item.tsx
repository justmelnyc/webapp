'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { deleteComment } from '@/actions/comment-actions'
import { ChevronIcon, PencilIcon, ReplyIcon, XBoxIcon } from '@/components/icons'
import { Hint } from '@/components/post-detail/hint'
import { Avatar } from '@/components/ui/avatar'
import { toast } from '@/stores/toast-store'
import type { Comment } from '@/types/post'
import { cn } from '@/utils/cn'
import { avatarUrl } from '@/utils/images'
import { timeAgoInWords } from '@/components/post-detail/time-ago-in-words'
import { CommentBody } from './comment-body'
import { CommentEditForm } from './comment-edit-form'
import { CommentFlagTool } from './comment-flag-tool'
import toolStyles from './comment-tools.module.css'
import styles from './comments.module.css'

interface CommentItemProps {
  comment: Comment
  postId: string
  isOwnComment: boolean
  /** The viewer may delete it: their own comment, or a comment on their own post. */
  canDelete: boolean
  onReply: (username: string) => void
  onDeleted: () => void
  onUpdated: () => void
}

/** One `.Comment` for a signed-in viewer: header, body and the CommentTools footer. */
export const CommentItem = ({
  comment,
  postId,
  isOwnComment,
  canDelete,
  onReply,
  onDeleted,
  onUpdated,
}: CommentItemProps) => {
  const [pending, startTransition] = useTransition()
  const [isMoreToolActive, setMoreToolActive] = useState(false)
  const [isEditing, setEditing] = useState(false)
  const { author } = comment
  const isShyToolSolo = !canDelete

  const remove = (): void => {
    if (!window.confirm('Delete this comment?')) return
    startTransition(async () => {
      const result = await deleteComment(postId, comment.id)
      if (!result.ok) return toast.error(result.error)
      onDeleted()
    })
  }

  const saved = (): void => {
    setEditing(false)
    onUpdated()
  }

  // While editing, the original swaps the body for the editor and hides the header and tools.
  if (isEditing) {
    return (
      <div className={cn('Comment', styles.comment)}>
        <CommentEditForm
          postId={postId}
          comment={comment}
          onSaved={saved}
          onCancel={() => setEditing(false)}
        />
      </div>
    )
  }

  return (
    <div className={cn('Comment', styles.comment)} style={pending ? { opacity: 0.5 } : undefined}>
      <header className={cn('CommentHeader', styles.header)}>
        <div className={cn('CommentHeaderAuthor', styles.author)}>
          <Link className={cn('CommentHeaderLink', styles.link)} href={`/${author.username}`}>
            <Avatar src={avatarUrl(author.avatar, 'regular')} name={author.username} />
            <span className="CommentUsername DraggableUsername">{`@${author.username}`}</span>
          </Link>
        </div>
      </header>
      <CommentBody comment={comment} />
      <footer
        className={cn(
          'PostTools CommentTools',
          toolStyles.tools,
          isMoreToolActive && cn('isMoreToolActive', toolStyles.isMoreToolActive),
          isShyToolSolo && cn('isShyToolSolo', toolStyles.isShyToolSolo),
        )}
      >
        {!isOwnComment ? (
          <span className="PostTool ReplyTool">
            <button type="button" onClick={() => onReply(author.username)}>
              <ReplyIcon />
              <Hint>Reply</Hint>
            </button>
          </span>
        ) : null}
        <span className="PostTool TimeAgoTool">
          <span className="PostToolValue">{timeAgoInWords(comment.createdAt)}</span>
        </span>
        <div className={toolStyles.shyTools}>
          <span className="PostTool MoreTool">
            <button type="button" onClick={() => setMoreToolActive((active) => !active)}>
              <ChevronIcon />
              <Hint>More</Hint>
            </button>
          </span>
          {!isOwnComment ? (
            <CommentFlagTool
              postId={postId}
              commentId={comment.id}
              className={cn('ShyTool', toolStyles.shyTool)}
            />
          ) : (
            <span className={cn('PostTool EditTool', toolStyles.shyTool)}>
              <button type="button" onClick={() => setEditing(true)} aria-label="Edit comment">
                <PencilIcon />
                <Hint>Edit</Hint>
              </button>
            </span>
          )}
          {canDelete ? (
            <span className={cn('PostTool DeleteTool', toolStyles.shyTool)}>
              <button type="button" onClick={remove} disabled={pending} aria-label="Delete comment">
                <XBoxIcon />
                <Hint>Delete</Hint>
              </button>
            </span>
          ) : null}
        </div>
      </footer>
    </div>
  )
}
