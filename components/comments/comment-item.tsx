'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { deleteComment } from '@/actions/comment-actions'
import { ChevronIcon, FlagIcon, ReplyIcon, XBoxIcon } from '@/components/icons'
import { Hint } from '@/components/post-detail/hint'
import { Avatar } from '@/components/ui/avatar'
import { toast } from '@/stores/toast-store'
import type { Comment } from '@/types/post'
import { cn } from '@/utils/cn'
import { avatarUrl } from '@/utils/images'
import { timeAgoInWords } from '@/components/post-detail/time-ago-in-words'
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
}

/** One `.Comment` for a signed-in viewer: header, body and the CommentTools footer. */
export const CommentItem = ({ comment, postId, isOwnComment, canDelete, onReply, onDeleted }: CommentItemProps) => {
  const [pending, startTransition] = useTransition()
  const [isMoreToolActive, setMoreToolActive] = useState(false)
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
      <div className={cn('CommentBody', styles.body)}>
        {comment.content.map((region, index) =>
          region.kind === 'text' ? (
            <div key={index} className="TextRegion">
              <div className="RegionContent" dangerouslySetInnerHTML={{ __html: region.data }} />
            </div>
          ) : null,
        )}
      </div>
      <footer
        className={cn('PostTools CommentTools', toolStyles.tools, isMoreToolActive && toolStyles.isMoreToolActive, isShyToolSolo && toolStyles.isShyToolSolo)}
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
            <span className={cn('PostTool FlagTool', toolStyles.shyTool)}>
              <button type="button" onClick={() => toast.info('Reporting is not available yet')}>
                <FlagIcon />
                <Hint>Flag</Hint>
              </button>
            </span>
          ) : null}
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
