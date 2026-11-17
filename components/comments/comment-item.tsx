'use client'

import Link from 'next/link'
import { useTransition } from 'react'
import { deleteComment } from '@/actions/comment-actions'
import { PostBody } from '@/components/posts/post-body'
import { Avatar } from '@/components/ui/avatar'
import { TextButton } from '@/components/ui/button'
import { toast } from '@/stores/toast-store'
import type { Comment } from '@/types/post'
import { avatarUrl } from '@/utils/images'
import { timeAgo } from '@/utils/time'

interface CommentItemProps {
  comment: Comment
  postId: string
  /** Only set when the viewer wrote this comment. */
  onDeleted?: () => void
}

export const CommentItem = ({ comment, postId, onDeleted }: CommentItemProps) => {
  const [pending, startTransition] = useTransition()
  const { author } = comment

  const remove = () => {
    if (!window.confirm('Delete this comment?')) return
    startTransition(async () => {
      const result = await deleteComment(postId, comment.id)
      if (!result.ok) return toast.error(result.error)
      onDeleted?.()
    })
  }

  return (
    <li className={pending ? 'flex gap-3 opacity-50' : 'flex gap-3'}>
      <Link href={`/${author.username}`}>
        <Avatar src={avatarUrl(author.avatar, 'regular')} name={author.username} size={36} />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-3 text-sm">
          <Link href={`/${author.username}`} className="text-slate hover:text-ink">
            @{author.username}
          </Link>
          <span className="text-ash text-xs">{timeAgo(comment.createdAt)}</span>
          {onDeleted && (
            <TextButton onClick={remove} disabled={pending} className="ml-auto text-xs" aria-label="Delete comment">
              Delete
            </TextButton>
          )}
        </div>
        <div className="text-[15px]">
          <PostBody regions={comment.content} />
        </div>
      </div>
    </li>
  )
}
