'use client'

import { useCallback } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { PostBody } from '@/components/posts/post-body'
import { PostCard } from '@/components/posts/post-card'
import { Spinner } from '@/components/ui/spinner'
import { TextButton } from '@/components/ui/button'
import { useInView } from '@/hooks/use-in-view'
import { fetchStreamPage } from '@/lib/client/streams'
import type { PostPage, StreamSpec } from '@/types/stream'

interface PostStreamProps {
  spec: StreamSpec
  /** First page, rendered on the server. */
  initialPage: PostPage
  signedIn: boolean
  emptyMessage?: string
}

/** A masonry feed that loads further pages as you scroll. */
export const PostStream = ({ spec, initialPage, signedIn, emptyMessage = 'Nothing here yet.' }: PostStreamProps) => {
  const query = useInfiniteQuery({
    queryKey: ['stream', spec],
    queryFn: ({ pageParam }) => fetchStreamPage(spec, pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => (last.isLastPage ? undefined : last.next),
    initialData: { pages: [initialPage], pageParams: [null] },
  })

  const { hasNextPage, isFetchingNextPage, fetchNextPage } = query
  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) void fetchNextPage()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])
  const sentinel = useInView(loadMore)

  const seen = new Set<string>()
  const posts = query.data.pages
    .flatMap((page) => page.posts)
    .filter((post) => (seen.has(post.id) ? false : (seen.add(post.id), true)))

  if (posts.length === 0) return <p className="text-ash py-20 text-center">{emptyMessage}</p>

  return (
    <>
      <div className="columns-1 gap-8 md:columns-2 xl:columns-3">
        {posts.map((post, index) => (
          <PostCard key={post.id} className="mb-10 break-inside-avoid">
            <PostCard.Header post={post} />
            <PostCard.Body>
              <PostBody regions={post.summary} assets={post.assets} loading={index < 3 ? 'eager' : 'lazy'} />
            </PostCard.Body>
            <PostCard.Footer post={post} signedIn={signedIn} />
          </PostCard>
        ))}
      </div>
      <div ref={sentinel} className="flex min-h-12 items-center justify-center py-6">
        {isFetchingNextPage && <Spinner />}
        {query.isError && <TextButton onClick={() => void fetchNextPage()}>Couldn’t load more. Try again</TextButton>}
      </div>
    </>
  )
}
