import { PostBodyRegions } from '@/components/posts/post-body'
import type { Comment } from '@/types/post'
import { cn } from '@/utils/cn'
import styles from './comments.module.css'
import './comment-body.css'

interface CommentBodyProps {
  comment: Comment
  /** In a grid stream the comment's text and pictures link to the post (`isGridMode` in `CommentContainer`). */
  detailPath?: string
}

/** The original's `CommentBody`: the comment's text and image regions (static regions, like a post page). */
export const CommentBody = ({ comment, detailPath }: CommentBodyProps) => (
  <div className={cn('CommentBody', styles.body)}>
    <PostBodyRegions postId={comment.id} regions={comment.content} assets={comment.assets ?? []} detailPath={detailPath} owner="comment" />
  </div>
)
