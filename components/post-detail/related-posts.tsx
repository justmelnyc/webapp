'use client'

import { PostsLightbox } from '@/components/lightbox/post-lightbox'
import { PostBody } from '@/components/posts/post-body'
import { PostCard } from '@/components/posts/post-card'
import { useColumnCount } from '@/components/streams/use-column-count'
import { relatedColumnCount, relatedPostsPerPage } from '@/constants/related-posts'
import type { Post } from '@/types/post'
import { cn } from '@/utils/cn'
import styles from './related-posts.module.css'
import '@/components/streams/columns.css'

interface RelatedPostsProps {
  /** Related posts in the API's order; a row of them is shown. */
  posts: Post[]
  viewerId: string | null
}

/** One related post (`PostContainer isRelatedPost`): drawn like a grid card, its summary linking to its page. */
const RelatedPost = ({ post, viewerId }: { post: Post; viewerId: string | null }) => (
  <div className="PostGrid">
    <PostCard>
      <PostCard.Header post={post} viewerId={viewerId} />
      <PostCard.Body>
        <PostBody
          postId={post.id}
          regions={post.summary}
          assets={post.assets}
          detailPath={`/${post.author.username}/post/${post.token}`}
          // the original loads related posts over REST, so it has their content warning (see PostContent)
          contentWarning={post.contentWarning}
        />
      </PostCard.Body>
      <PostCard.RelatedFooter post={post} signedIn={!!viewerId} viewerId={viewerId} />
    </PostCard>
  </div>
)

/**
 * The original's related-posts stream under a post (`RelatedPostsStreamContainer`, `postsAsRelated`):
 * a "Related Posts" title and one row of posts, as many as the viewport has columns for. Nothing is
 * drawn when the post has no related posts.
 */
export const RelatedPosts = ({ posts, viewerId }: RelatedPostsProps) => {
  const viewportColumns = useColumnCount()
  const shown = posts.slice(0, relatedPostsPerPage(viewportColumns))
  if (shown.length === 0) return <section className="StreamContainer empty" />
  const columns: Post[][] = Array.from({ length: relatedColumnCount(viewportColumns) }, () => [])
  shown.forEach((post, index) => columns[index % columns.length]?.push(post))
  return (
    <section className={cn('StreamContainer RelatedPostsStreamContainer', styles.related)}>
      <div className="with-lightbox">
        <PostsLightbox posts={shown} viewerId={viewerId} tools="related">
          <div className="Posts asGrid">
            <h2 className={styles.relatedTitle}>Related Posts</h2>
            {columns.map((column, index) => (
              <div key={index} className={cn('Column', styles.column)}>
                {column.map((post) => (
                  <RelatedPost key={post.id} post={post} viewerId={viewerId} />
                ))}
              </div>
            ))}
          </div>
        </PostsLightbox>
      </div>
    </section>
  )
}
