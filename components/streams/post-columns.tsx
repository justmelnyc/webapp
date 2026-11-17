import { PostBody } from '@/components/posts/post-body'
import { PostCard } from '@/components/posts/post-card'
import type { Post } from '@/types/post'

interface PostProps {
  post: Post
  signedIn: boolean
  viewerId?: string | null
  /** Posts near the top load their images eagerly. */
  eager: boolean
  /** The original hides the author header when the whole page is one person's posts. */
  showHeader: boolean
}

const detailPath = (post: Post): string => `/${post.author.username}/post/${post.token}`

const GridPost = ({ post, signedIn, viewerId, eager, showHeader }: PostProps) => (
  <div className="PostGrid">
    <PostCard className={showHeader ? undefined : 'isPostHeaderHidden'}>
      {showHeader && <PostCard.Header post={post} viewerId={viewerId} />}
      <PostCard.Body>
        <PostBody regions={post.summary} assets={post.assets} loading={eager ? 'eager' : 'lazy'} detailPath={detailPath(post)} />
      </PostCard.Body>
      <PostCard.Footer post={post} signedIn={signedIn} viewerId={viewerId} />
    </PostCard>
  </div>
)

const ListPost = ({ post, signedIn, viewerId, eager, showHeader }: PostProps) => (
  <div className="PostList">
    <PostCard className={showHeader ? undefined : 'isPostHeaderHidden'}>
      {showHeader && <PostCard.Header post={post} viewerId={viewerId} />}
      <PostCard.Body>
        <PostBody regions={post.content} assets={post.assets} loading={eager ? 'eager' : 'lazy'} />
      </PostCard.Body>
      <PostCard.Footer post={post} signedIn={signedIn} viewerId={viewerId} showWatch />
    </PostCard>
  </div>
)

interface ColumnsProps {
  posts: Post[]
  columnCount: number
  signedIn: boolean
  viewerId?: string | null
  showHeader?: boolean
}

/** Posts dealt into columns in turn (index % columnCount), like the original's `postsAsGrid`. */
export const PostsAsGrid = ({ posts, columnCount, signedIn, viewerId, showHeader = true }: ColumnsProps) => {
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
            />
          ))}
        </div>
      ))}
    </div>
  )
}

/** One post per row, with the full content (`postsAsList`). */
export const PostsAsList = ({ posts, signedIn, viewerId, showHeader = true }: Omit<ColumnsProps, 'columnCount'>) => (
  <div className="Posts asList">
    {posts.map((post, index) => (
      <ListPost key={post.id} post={post} signedIn={signedIn} viewerId={viewerId} eager={index < 2} showHeader={showHeader} />
    ))}
  </div>
)
