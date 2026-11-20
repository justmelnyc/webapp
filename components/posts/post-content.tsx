import { PostBody, PostBodyRegions } from '@/components/posts/post-body'
import { RepostEditorGate } from '@/components/posts/repost-editor-gate'
import { SHOW_CONTENT_WARNING_ON_FEEDS } from '@/constants/content-warning'
import { Avatar } from '@/components/ui/avatar'
import type { Post } from '@/types/post'
import { avatarUrl } from '@/utils/images'
import { isRepost } from '@/utils/repost'
import './repost-body.css'

interface PostContentProps {
  post: Post
  /** Grid streams show the summary and link into the post; lists show the whole content. */
  mode: 'grid' | 'list'
  eager: boolean
  /**
   * Show the NSFW "View" button. The original only has a post's `contentWarning` where it loaded the
   * post over REST, which a submission stream does and the GraphQL feeds do not.
   */
  showContentWarning?: boolean
}

/**
 * The original's `PostBody` choice. A repost shows the original's content (`repostContent`, or the
 * summary in a grid) and, in a list, the reposter's own words below it with their avatar.
 */
export const PostContent = ({ post, mode, eager, showContentWarning = SHOW_CONTENT_WARNING_ON_FEEDS }: PostContentProps) => (
  <RepostEditorGate post={post} layout={mode}>
    <PostRegions post={post} mode={mode} eager={eager} showContentWarning={showContentWarning} />
  </RepostEditorGate>
)

const PostRegions = ({ post, mode, eager, showContentWarning }: PostContentProps) => {
  const contentWarning = showContentWarning ? post.contentWarning : null
  const loading = eager ? 'eager' : 'lazy'
  const detailPath = `/${post.author.username}/post/${post.token}`
  if (mode === 'grid') {
    return <PostBody
        postId={post.id}
        regions={post.summary}
        assets={post.assets}
        loading={loading}
        detailPath={detailPath}
        contentWarning={contentWarning}
      />
  }
  if (!isRepost(post)) return <PostBody postId={post.id} regions={post.content} assets={post.assets} loading={loading} contentWarning={contentWarning} />
  return (
    <PostBody postId={post.id} regions={post.repostContent ?? []} assets={post.assets} loading={loading} contentWarning={contentWarning}>
      {post.content.length > 0 && (
        <div className="PostBody RepostedBody">
          <Avatar href={`/${post.author.username}`} src={avatarUrl(post.author.avatar, 'regular')} name={post.author.username} />
          <PostBodyRegions postId={post.id} regions={post.content} assets={post.assets} loading={loading} />
        </div>
      )}
    </PostBody>
  )
}
