import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import { PostDetail } from '@/components/post-detail/post-detail'
import { NotFoundError } from '@/lib/errors'
import { getViewer } from '@/services/viewer'
import { avatarUrl } from '@/utils/images'
import { getComments, getPost } from '@/services/posts'
import type { Post } from '@/types/post'

interface PostPageProps {
  params: Promise<{ username: string; token: string }>
}

const loadPost = cache(async (username: string, token: string): Promise<Post> => {
  try {
    return await getPost(username, token)
  } catch (error) {
    if (error instanceof NotFoundError) notFound()
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
  return { title: `@${post.author.username} on Ello`, description: plainText(post) || undefined }
}

const PostPage = async ({ params }: PostPageProps) => {
  const { username, token } = await params
  const [post, viewer] = await Promise.all([loadPost(username, token), getViewer()])
  const initialComments = viewer ? await getComments(post.id) : { comments: [], next: null, isLastPage: true }

  return (
    <PostDetail
      post={post}
      viewer={viewer ? { id: viewer.id, username: viewer.username, avatar: avatarUrl(viewer.avatar, 'regular') } : null}
      initialComments={initialComments}
    />
  )
}

export default PostPage
