import { CommentSection } from '@/components/comments/comment-section'
import type { Post } from '@/types/post'
import type { CommentPage } from '@/types/stream'
import { cn } from '@/utils/cn'
import { DetailBody } from './detail-body'
import { DetailHeader } from './detail-header'
import { DetailTools } from './detail-tools'
import styles from './post-detail.module.css'
import { RelatedPosts } from './related-posts'
import toolStyles from './post-detail-tools.module.css'

interface PostDetailProps {
  post: Post
  viewer: { id: string; username: string; avatar: string | null } | null
  initialComments: CommentPage
}

/**
 * The original's `PostDetail` view. Below 60em everything stacks in the `PostList` article; from
 * 60em the article keeps the body and the right-hand `PostSideBar` holds header, tools, comments
 * and the bottom tools. Both are rendered and CSS shows the one that fits; the comment section
 * renders only in the placement that matches the viewport. Comments are for signed-in viewers
 * only, like the original's `CommentContent`.
 */
export const PostDetail = ({ post, viewer, initialComments }: PostDetailProps) => {
  const viewerId = viewer?.id ?? null
  const comments = (placement: 'inline' | 'aside') =>
    viewer ? (
      <CommentSection
        postId={post.id}
        postAuthorId={post.author.id}
        viewer={viewer}
        initialPage={initialComments}
        placement={placement}
      />
    ) : null

  return (
    <>
      <div className={cn('Hero', styles.spacer)} />
      <div className={cn('PostDetail', styles.root)}>
        <div className={cn('PostDetails Posts asList', styles.details)}>
          <article className={cn('PostList', styles.list)} id={`Post_${post.id}`}>
            <div className={cn('Post', styles.post, toolStyles.post)}>
              <div className={styles.narrowOnly}>
                <DetailHeader post={post} viewerId={viewerId} />
              </div>
              <DetailBody postId={post.id} regions={post.content} assets={post.assets} />
              <div className={styles.narrowOnly}>
                <DetailTools post={post} viewerId={viewerId} />
              </div>
            </div>
            {comments('inline')}
            <RelatedPosts />
            <div className={cn('PostDetailAsideBottom', styles.narrowOnly, toolStyles.bottom)}>
              <DetailTools post={post} viewerId={viewerId} />
              <aside className={cn('CategoryHistory', toolStyles.categoryHistory)} />
            </div>
          </article>
          <aside className={cn('PostSideBar', styles.aside)}>
            <div className={cn('PostDetailAsideTop', toolStyles.top)}>
              <DetailHeader post={post} viewerId={viewerId} />
              <DetailTools post={post} viewerId={viewerId} />
            </div>
            {comments('aside')}
            <div className={cn('PostDetailAsideBottom', toolStyles.bottom)}>
              <DetailTools post={post} viewerId={viewerId} />
              <aside className={cn('CategoryHistory', toolStyles.categoryHistory)} />
            </div>
          </aside>
        </div>
      </div>
    </>
  )
}
