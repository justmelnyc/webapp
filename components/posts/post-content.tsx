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
}

/**
 * The original's `PostBody` choice. A repost shows the original's content (`repostContent`, or the
 * summary in a grid) and, in a list, the reposter's own words below it with their avatar.
 */
export const PostContent = ({ post, mode, eager }: PostContentProps) => (
  <RepostEditorGate post={post} layout={mode}>
    <PostRegions post={post} mode={mode} eager={eager} />
  </RepostEditorGate>
)

const PostRegions = ({ post, mode, eager }: PostContentProps) => {
  const contentWarning = SHOW_CONTENT_WARNING_ON_FEEDS ? post.contentWarning : null
  const loading = eager ? 'eager' : 'lazy'
  const detailPath = `/${post.author.username}/post/${post.token}`
  if (mode === 'grid') {
    return <PostBody
        regions={post.summary}
        assets={post.assets}
        loading={loading}
        detailPath={detailPath}
        contentWarning={contentWarning}
      />
  }
  if (!isRepost(post)) return <PostBody regions={post.content} assets={post.assets} loading={loading} contentWarning={contentWarning} />
  return (
    <PostBody regions={post.repostContent ?? []} assets={post.assets} loading={loading} contentWarning={contentWarning}>
      {post.content.length > 0 && (
        <div className="PostBody RepostedBody">
          <Avatar href={`/${post.author.username}`} src={avatarUrl(post.author.avatar, 'regular')} name={post.author.username} />
          <PostBodyRegions regions={post.content} assets={post.assets} loading={loading} />
        </div>
      )}
    </PostBody>
  )
}
