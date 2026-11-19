import type { Post } from '@/types/post'
import { CategoryHistoryRecord } from './category-history-record'

/**
 * The original's `CategoryPostHistory`: under the post tools of a post page, one line per category
 * the post sits in ("Featured by @ello."). Curators and moderators get the feature / unfeature
 * button the API offers them in `actions`.
 */
export const CategoryHistory = ({ post, className }: { post: Post; className?: string }) => (
  <aside className={className ? `CategoryHistory ${className}` : 'CategoryHistory'}>
    {(post.categoryPosts ?? []).map((categoryPost) => (
      <CategoryHistoryRecord key={categoryPost.id} categoryPost={categoryPost} authorUsername={post.author.username} />
    ))}
  </aside>
)
