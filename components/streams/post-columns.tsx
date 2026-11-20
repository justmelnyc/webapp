import { StreamComments } from '@/components/comments/stream-comments'
import { CategoryHeader, categoryOf } from '@/components/posts/category-header'
import { EditablePostBody } from '@/components/posts/editable-post-body'
import { PostCard } from '@/components/posts/post-card'
import { PostContent } from '@/components/posts/post-content'
import { SubmissionHeader } from '@/components/posts/submission-header'
import { SHOW_CONTENT_WARNING_ON_FEEDS } from '@/constants/content-warning'
import type { Post } from '@/types/post'
import { isRepost } from '@/utils/repost'

interface PostProps {
  post: Post
  signedIn: boolean
  viewerId?: string | null
  /** Posts near the top load their images eagerly. */
  eager: boolean
  /** The original hides the author header when the whole page is one person's posts. */
  showHeader: boolean
  /** Global and subscribed feeds name a post's category instead of the plain header (`selectShowCategoryHeader`). */
  showCategoryHeader: boolean
  /** Whether an NSFW post gets its "View" button here (the original's search results, loaded over REST, do). */
  showContentWarning: boolean
}

/** The original's header choice: a repost header, a category header, an invite submission header, or the author header. */
const StreamHeader = ({ post, viewerId, showHeader, showCategoryHeader }: Omit<PostProps, 'signedIn' | 'eager' | 'showContentWarning'>) => {
  if (!showHeader && !isRepost(post)) return null
  if (showCategoryHeader && !isRepost(post) && categoryOf(post)) return <CategoryHeader post={post} viewerId={viewerId} />
  if (showCategoryHeader && !isRepost(post) && post.artistInviteSubmission) return <SubmissionHeader post={post} viewerId={viewerId} />
  return <PostCard.Header post={post} viewerId={viewerId} inUserDetail={!showHeader} />
}

const GridPost = ({ post, signedIn, viewerId, eager, showHeader, showCategoryHeader, showContentWarning }: PostProps) => (
  <div className="PostGrid">
    <PostCard className={showHeader || isRepost(post) ? undefined : 'isPostHeaderHidden'}>
      <StreamHeader post={post} viewerId={viewerId} showHeader={showHeader} showCategoryHeader={showCategoryHeader} />
      <PostCard.Body>
        <EditablePostBody postId={post.id}>
          <PostContent post={post} mode="grid" eager={eager} showContentWarning={showContentWarning} />
        </EditablePostBody>
      </PostCard.Body>
      <PostCard.Footer post={post} signedIn={signedIn} viewerId={viewerId} />
      <StreamComments post={post} viewerId={viewerId} />
    </PostCard>
  </div>
)

const ListPost = ({ post, signedIn, viewerId, eager, showHeader, showCategoryHeader, showContentWarning }: PostProps) => (
  <div className="PostList">
    <PostCard className={showHeader || isRepost(post) ? undefined : 'isPostHeaderHidden'}>
      <StreamHeader post={post} viewerId={viewerId} showHeader={showHeader} showCategoryHeader={showCategoryHeader} />
      <PostCard.Body>
        <EditablePostBody postId={post.id}>
          <PostContent post={post} mode="list" eager={eager} showContentWarning={showContentWarning} />
        </EditablePostBody>
      </PostCard.Body>
      <PostCard.Footer post={post} signedIn={signedIn} viewerId={viewerId} showWatch />
      <StreamComments post={post} viewerId={viewerId} />
    </PostCard>
  </div>
)

interface ColumnsProps {
  posts: Post[]
  columnCount: number
  signedIn: boolean
  viewerId?: string | null
  showHeader?: boolean
  showCategoryHeader?: boolean
  showContentWarning?: boolean
}

/** Posts dealt into columns in turn (index % columnCount), like the original's `postsAsGrid`. */
export const PostsAsGrid = ({ posts, columnCount, signedIn, viewerId, showHeader = true, showCategoryHeader = false, showContentWarning = SHOW_CONTENT_WARNING_ON_FEEDS }: ColumnsProps) => {
  const columns: { post: Post; index: number }[][] = Array.from({ length: columnCount }, () => [])
  posts.forEach((post, index) => columns[index % columnCount]?.push({ post, index }))
  return (
    <div className="Posts asGrid">
      {columns.map((column, i) => (
        <div className="Column" key={i}>
          {column.map(({ post, index }) => (
            <GridPost
              key={post.id}
              post={post}
              signedIn={signedIn}
              viewerId={viewerId}
              eager={index < columnCount}
              showHeader={showHeader}
              showCategoryHeader={showCategoryHeader}
              showContentWarning={showContentWarning}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

/** One post per row, with the full content (`postsAsList`). */
export const PostsAsList = ({ posts, signedIn, viewerId, showHeader = true, showCategoryHeader = false, showContentWarning = SHOW_CONTENT_WARNING_ON_FEEDS }: Omit<ColumnsProps, 'columnCount'>) => (
  <div className="Posts asList">
    {posts.map((post, index) => (
      <ListPost key={post.id} post={post} signedIn={signedIn} viewerId={viewerId} eager={index < 2} showHeader={showHeader} showCategoryHeader={showCategoryHeader} showContentWarning={showContentWarning} />
    ))}
  </div>
)
