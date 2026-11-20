'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import { fetchCommentPage } from '@/components/comments/fetch-comments'
import type { Comment } from '@/types/post'
import type { CommentPage } from '@/types/stream'

export const commentsQueryKey = (postId: string): readonly ['comments', string] => ['comments', postId]

interface CommentPages {
  /** Every loaded comment once, oldest first. */
  comments: Comment[]
  /** No page has arrived yet (a stream's comments that were just opened). */
  isPending: boolean
  isError: boolean
  hasNextPage: boolean
  isFetchingNextPage: boolean
  fetchNextPage: () => void
}

/**
 * A post's comments, ten per page. A post page hands over the first page it rendered on the
 * server; a stream has none and loads it when the comments are opened.
 */
export const useCommentPages = (postId: string, initialPage?: CommentPage): CommentPages => {
  const query = useInfiniteQuery({
    queryKey: commentsQueryKey(postId),
    queryFn: ({ pageParam }) => fetchCommentPage(postId, pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => (last.isLastPage ? undefined : last.next),
    initialData: initialPage ? { pages: [initialPage], pageParams: [null] } : undefined,
  })
  const seen = new Set<string>()
  const comments = (query.data?.pages ?? [])
    .flatMap((page) => page.comments)
    .filter((comment) => (seen.has(comment.id) ? false : (seen.add(comment.id), true)))
  return {
    comments,
    isPending: query.isPending,
    isError: query.isError,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    fetchNextPage: () => void query.fetchNextPage(),
  }
}
