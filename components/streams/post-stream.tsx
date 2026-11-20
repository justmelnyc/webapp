'use client'

import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { usePathname } from 'next/navigation'
import { useCategoryDrawer } from '@/components/discover/category-drawer'
import { useLayoutModeStore } from '@/components/layout/layout-mode-store'
import { PostsLightbox } from '@/components/lightbox/post-lightbox'
import { PostPaginator } from '@/components/streams/post-paginator'
import { PostsAsGrid, PostsAsList } from '@/components/streams/post-columns'
import { useColumnCount } from '@/components/streams/use-column-count'
import { useNewPosts } from '@/components/streams/use-new-posts'
import { useInView } from '@/hooks/use-in-view'
import { fetchStreamPage } from '@/lib/client/streams'
import { SHOW_CONTENT_WARNING_ON_FEEDS } from '@/constants/content-warning'
import type { PostPage, StreamSpec } from '@/types/stream'
import { showsCategoryHeader } from '@/utils/category-header-route'
import './stream.css'
import './columns.css'

interface PostStreamProps {
  spec: StreamSpec
  /** First page, rendered on the server. */
  initialPage: PostPage
  signedIn: boolean
  /** The signed-in user's id; enables the owner menu on their own posts. */
  viewerId?: string | null
  /** What an empty stream shows: a string becomes a paragraph, anything else is drawn as is (the original's `asZero`). */
  emptyMessage?: ReactNode
}

/** The original's StreamContainer: posts as columns (or a list) that load further pages on scroll. */
export const PostStream = ({ spec, initialPage, signedIn, viewerId, emptyMessage = 'Nothing here yet.' }: PostStreamProps) => {
  const showCategoryHeader = showsCategoryHeader(usePathname())
  const mode = useLayoutModeStore((state) => state.mode)
  // a category's open info panel takes one column from 60em up (StreamContainer: innerWidth > 959)
  const { isOpen: isDrawerOpen } = useCategoryDrawer()
  const viewportColumns = useColumnCount()
  const columnCount = isDrawerOpen && viewportColumns > 2 ? viewportColumns - 1 : viewportColumns
  const query = useInfiniteQuery({
    queryKey: ['stream', spec],
    queryFn: ({ pageParam }) => fetchStreamPage(spec, pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => (last.isLastPage ? undefined : last.next),
    initialData: { pages: [initialPage], pageParams: [null] },
    // never refetched behind the reader's back: reopening a stream goes through useNewPosts ("New Posts"), like the original
    staleTime: Infinity,
  })
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = query
  useNewPosts(spec)
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
  // The original loads search results over REST, which keeps `contentWarning`: NSFW posts get their "View" button there.
  const showContentWarning = spec.type === 'search' || SHOW_CONTENT_WARNING_ON_FEEDS

  if (posts.length === 0) {
    return (
      <section className="StreamContainer empty">
        {typeof emptyMessage === 'string' ? <p>{emptyMessage}</p> : emptyMessage}
      </section>
    )
  }
  return (
    <section className="StreamContainer">
      <PostsLightbox posts={posts} viewerId={viewerId ?? null} isGridMode={mode === 'grid'}>
        {mode === 'grid' ? (
          <PostsAsGrid posts={posts} columnCount={columnCount} signedIn={signedIn} viewerId={viewerId} showHeader={showHeader} showCategoryHeader={showCategoryHeader} showContentWarning={showContentWarning} />
        ) : (
          <PostsAsList posts={posts} signedIn={signedIn} viewerId={viewerId} showHeader={showHeader} showCategoryHeader={showCategoryHeader} showContentWarning={showContentWarning} />
        )}
      </PostsLightbox>
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
