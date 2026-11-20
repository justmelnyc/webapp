import type { Metadata } from 'next'
import { cache } from 'react'
import { PageOffset } from '@/components/layout/page-offset'
import { PostDetail } from '@/components/post-detail/post-detail'
import { NotFoundError } from '@/lib/errors'
import { getViewer } from '@/services/viewer'
import { avatarUrl } from '@/utils/images'
import { getComments, getPost } from '@/services/posts'
import { getRelatedPosts } from '@/services/related-posts'
import type { Post } from '@/types/post'

interface PostPageProps {
  params: Promise<{ username: string; token: string }>
}

/** The post, or null when there is none at that address. */
const loadPost = cache(async (username: string, token: string): Promise<Post | null> => {
  try {
    return await getPost(username, token)
  } catch (error) {
    if (error instanceof NotFoundError) return null
    throw error
  }
})

const plainText = (post: Post): string =>
  post.summary
    .flatMap((region) => (region.kind === 'text' ? [region.data.replace(/<[^>]*>/g, ' ')] : []))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 160)

export const generateMetadata = async ({ params }: PostPageProps): Promise<Metadata> => {
  const { username, token } = await params
  const post = await loadPost(username, token)
  if (!post) return {}
  return { title: `@${post.author.username} on Ello`, description: plainText(post) || undefined }
}

const PostPage = async ({ params }: PostPageProps) => {
  const { username, token } = await params
  const [post, viewer] = await Promise.all([loadPost(username, token), getViewer()])
  // A post that does not exist: the original never leaves its loading state, which draws an empty stream
  // container and nothing else (its error view waits for an action type the GraphQL load never sends).
  if (!post) {
    return (
      <>
        <PageOffset>{null}</PageOffset>
        <section className="StreamContainer" />
      </>
    )
  }
  const [initialComments, relatedPosts] = await Promise.all([
    viewer ? getComments(post.id) : { comments: [], next: null, isLastPage: true },
    getRelatedPosts(post.token),
  ])

  return (
    <PostDetail
      post={post}
      viewer={viewer ? { id: viewer.id, username: viewer.username, avatar: avatarUrl(viewer.avatar, 'regular') } : null}
      initialComments={initialComments}
      relatedPosts={relatedPosts}
    />
  )
}

export default PostPage
