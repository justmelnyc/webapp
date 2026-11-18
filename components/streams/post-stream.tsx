'use client'

import { useCallback, useEffect, useState } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useLayoutModeStore } from '@/components/layout/layout-mode-store'
import { PostPaginator } from '@/components/streams/post-paginator'
import { PostsAsGrid, PostsAsList } from '@/components/streams/post-columns'
import { useColumnCount } from '@/components/streams/use-column-count'
import { useInView } from '@/hooks/use-in-view'
import { fetchStreamPage } from '@/lib/client/streams'
import type { PostPage, StreamSpec } from '@/types/stream'
import './stream.css'

interface PostStreamProps {
  spec: StreamSpec
  /** First page, rendered on the server. */
  initialPage: PostPage
  signedIn: boolean
  /** The signed-in user's id; enables the owner menu on their own posts. */
  viewerId?: string | null
  emptyMessage?: string
}

/** The original's StreamContainer: posts as columns (or a list) that load further pages on scroll. */
export const PostStream = ({ spec, initialPage, signedIn, viewerId, emptyMessage = 'Nothing here yet.' }: PostStreamProps) => {
  const mode = useLayoutModeStore((state) => state.mode)
  const columnCount = useColumnCount()
  const query = useInfiniteQuery({
    queryKey: ['stream', spec],
    queryFn: ({ pageParam }) => fetchStreamPage(spec, pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => (last.isLastPage ? undefined : last.next),
    initialData: { pages: [initialPage], pageParams: [null] },
  })
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = query
  // Like the original, further pages load once the reader scrolls (the 'Load More' pill is the fallback).
  const [hasScrolled, setHasScrolled] = useState(false)
  useEffect(() => {
    const onScroll = (): void => setHasScrolled(true)
    window.addEventListener('scroll', onScroll, { once: true, passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) void fetchNextPage()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])
  const loadOnScroll = useCallback(() => {
    if (hasScrolled) loadMore()
  }, [hasScrolled, loadMore])
  const sentinel = useInView(loadOnScroll)

  const seen = new Set<string>()
  const posts = query.data.pages
    .flatMap((page) => page.posts)
    .filter((post) => (seen.has(post.id) ? false : (seen.add(post.id), true)))

  // On a profile's posts tab the whole page is one person, so the original drops the author header.
  const showHeader = spec.type !== 'user'

  if (posts.length === 0) {
    return (
      <section className="StreamContainer empty">
        <p>{emptyMessage}</p>
      </section>
    )
  }
  return (
    <section className="StreamContainer">
      {mode === 'grid' ? (
        <PostsAsGrid posts={posts} columnCount={columnCount} signedIn={signedIn} viewerId={viewerId} showHeader={showHeader} />
      ) : (
        <PostsAsList posts={posts} signedIn={signedIn} viewerId={viewerId} showHeader={showHeader} />
      )}
      {hasNextPage && <PostPaginator isBusy={isFetchingNextPage} onLoadMore={loadMore} />}
      <div ref={sentinel} aria-hidden />
      {query.isError && (
        <p role="alert" className="mt-10 text-center">
          Couldn’t load more. <button type="button" onClick={() => void fetchNextPage()}>Try again</button>
        </p>
      )}
    </section>
  )
}
