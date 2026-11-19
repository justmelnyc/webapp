import { PostBodyRegions } from '@/components/posts/post-body'
import type { Comment } from '@/types/post'
import { cn } from '@/utils/cn'
import styles from './comments.module.css'
import './comment-body.css'

/** The original's `CommentBody`: the comment's text and image regions (static regions, like a post page). */
export const CommentBody = ({ comment }: { comment: Comment }) => (
  <div className={cn('CommentBody', styles.body)}>
    <PostBodyRegions regions={comment.content} assets={comment.assets ?? []} />
  </div>
)
