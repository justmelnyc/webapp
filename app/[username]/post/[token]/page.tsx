import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import { CommentSection } from '@/components/comments/comment-section'
import { WatchButton } from '@/components/post-detail/watch-button'
import { LoveButton } from '@/components/posts/love-button'
import { PostBody } from '@/components/posts/post-body'
import { PostCard } from '@/components/posts/post-card'
import { NotFoundError } from '@/lib/errors'
import { getSession } from '@/lib/session'
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
  const [post, session] = await Promise.all([loadPost(username, token), getSession()])
  const initialComments = await getComments(post.id)
  const signedIn = session !== null

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-10 px-4 py-8">
      <PostCard>
        <PostCard.Header post={post} viewerId={session?.id ?? null} />
        <PostCard.Body className="text-base">
          <PostBody regions={post.content} assets={post.assets} loading="eager" />
        </PostCard.Body>
        <footer className="text-ash flex items-center gap-5 text-sm">
          <span title="Views">👁 {post.postStats.viewsCount}</span>
          <span title="Comments">💬 {post.postStats.commentsCount}</span>
          <LoveButton
            postId={post.id}
            loved={post.currentUserState.loved}
            count={post.postStats.lovesCount}
            signedIn={signedIn}
          />
          <span className="ml-auto">
            <WatchButton postId={post.id} watching={post.currentUserState.watching} signedIn={signedIn} />
          </span>
        </footer>
      </PostCard>
      <CommentSection
        postId={post.id}
        viewerId={session?.id ?? null}
        loginNext={`/${post.author.username}/post/${post.token}`}
        initialPage={initialComments}
      />
    </main>
  )
}

export default PostPage
