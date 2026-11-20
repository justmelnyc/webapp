'use client'

import { CommentItem } from '@/components/comments/comment-item'
import { CommentsLightbox } from '@/components/lightbox/post-lightbox'
import { useIsStaff } from '@/components/ui/staff-context'
import type { Comment, Post } from '@/types/post'
import { cn } from '@/utils/cn'
import styles from './comments.module.css'

interface CommentListProps {
  comments: Comment[]
  /** The post the comments belong to (its tools show in the lightbox of comment pictures). */
  post: Post
  viewerId: string
  onReply: (username: string) => void
  /** A comment was edited or deleted. */
  onChanged: () => void
  onDeleted?: () => void
  /** The post's page, in a grid stream only: comment text and pictures link there. */
  detailPath?: string
}

/** The original's `commentsAsList`: the comments of a post, with the lightbox for their pictures. */
export const CommentList = ({ comments, post, viewerId, onReply, onChanged, onDeleted = onChanged, detailPath }: CommentListProps) => {
  // `selectCommentCanBeDeleted`: staff may delete anybody's comment
  const isStaff = useIsStaff()
  return (
    <div className="with-lightbox">
      <CommentsLightbox comments={comments} post={post} viewerId={viewerId}>
        <div className={cn('Comments', styles.comments)}>
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postId={post.id}
              isOwnComment={comment.author.id === viewerId}
              canDelete={isStaff || comment.author.id === viewerId || post.author.id === viewerId}
              onReply={onReply}
              onDeleted={onDeleted}
              onUpdated={onChanged}
              detailPath={detailPath}
            />
          ))}
        </div>
      </CommentsLightbox>
    </div>
  )
}
