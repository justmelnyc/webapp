'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { CommentForm } from '@/components/comments/comment-form'
import { CommentItem } from '@/components/comments/comment-item'
import { fetchCommentPage } from '@/components/comments/fetch-comments'
import { OutlineButton } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import type { CommentPage } from '@/types/stream'

interface CommentSectionProps {
  postId: string
  /** The viewer's user id, or null when logged out. */
  viewerId: string | null
  /** Where to send logged-out viewers after they log in. */
  loginNext: string
  /** First page, rendered on the server. */
  initialPage: CommentPage
}

export const CommentSection = ({ postId, viewerId, loginNext, initialPage }: CommentSectionProps) => {
  const router = useRouter()
  const queryClient = useQueryClient()
  const queryKey = ['comments', postId]

  const query = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) => fetchCommentPage(postId, pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => (last.isLastPage ? undefined : last.next),
    initialData: { pages: [initialPage], pageParams: [null] },
  })

  const changed = () => {
    void queryClient.invalidateQueries({ queryKey })
    router.refresh()
  }

  const seen = new Set<string>()
  const comments = query.data.pages
    .flatMap((page) => page.comments)
    .filter((comment) => (seen.has(comment.id) ? false : (seen.add(comment.id), true)))

  return (
    <section className="flex flex-col gap-6" aria-label="Comments">
      {viewerId ? (
        <CommentForm postId={postId} onCreated={changed} />
      ) : (
        <p className="text-slate text-sm">
          <Link href={`/enter?next=${encodeURIComponent(loginNext)}`} className="text-ink underline">
            Log in to comment
          </Link>
        </p>
      )}
      {comments.length === 0 ? (
        <p className="text-ash py-6 text-center">No comments yet.</p>
      ) : (
        <ul className="flex flex-col gap-6">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postId={postId}
              onDeleted={comment.author.id === viewerId ? changed : undefined}
            />
          ))}
        </ul>
      )}
      {query.isFetching && !query.isFetchingNextPage && <Spinner />}
      {query.hasNextPage && (
        <OutlineButton onClick={() => void query.fetchNextPage()} disabled={query.isFetchingNextPage} className="self-center">
          {query.isFetchingNextPage ? 'Loading…' : 'Load more'}
        </OutlineButton>
      )}
      {query.isError && <p className="text-ello-red text-sm">Couldn’t load comments.</p>}
    </section>
  )
}
