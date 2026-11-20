'use client'

import { useEffect } from 'react'
import { useQueryClient, type InfiniteData } from '@tanstack/react-query'
import { fetchStreamPage } from '@/lib/client/streams'
import { useNewPostsStore } from '@/stores/new-posts-store'
import type { PostPage, StreamSpec } from '@/types/stream'

type StreamData = InfiniteData<PostPage, string | null>

/** The original replaces the stream when a whole page of posts is new; fewer are offered behind the button. */
const FULL_PAGE = 20

/** After the first page arrives on top of what is loaded, scroll to where the stream starts. */
const scrollToStream = (spec: StreamSpec): void => {
  const hero = spec.type === 'user' ? document.querySelector('.Hero') : null
  window.scrollTo({ top: hero instanceof HTMLElement ? hero.offsetHeight : 0 })
}

/**
 * The original asks for a stream's first page again every time the page opens. Posts it has not shown yet wait
 * behind the navbar's "New Posts" button (`morePostIds`); a full page of them replaces the stream.
 */
export const useNewPosts = (spec: StreamSpec): void => {
  const queryClient = useQueryClient()
  const specKey = JSON.stringify(spec)
  useEffect(() => {
    const queryKey = ['stream', spec]
    let cancelled = false
    fetchStreamPage(spec, null)
      .then((fresh) => {
        if (cancelled || !queryClient.getQueryData<StreamData>(queryKey)) return
        // posts that are already shown take the fresh copy (its counts), as the original's store did when the page came back
        const freshById = new Map(fresh.posts.map((post) => [post.id, post]))
        const current = queryClient.setQueryData<StreamData>(queryKey, (old) =>
          old && { ...old, pages: old.pages.map((page) => ({ ...page, posts: page.posts.map((post) => freshById.get(post.id) ?? post) })) },
        )
        if (!current) return
        const shown = new Set(current.pages.flatMap((page) => page.posts.map((post) => post.id)))
        const unseen = fresh.posts.filter((post) => !shown.has(post.id))
        if (unseen.length === 0) return
        if (unseen.length >= FULL_PAGE) {
          queryClient.setQueryData<StreamData>(queryKey, { pages: [fresh], pageParams: [null] })
          return
        }
        useNewPostsStore.getState().offer(unseen.length, () => {
          queryClient.setQueryData<StreamData>(queryKey, (old) => {
            const [first, ...rest] = old?.pages ?? []
            if (!old || !first) return old
            return { ...old, pages: [{ ...first, posts: [...unseen, ...first.posts] }, ...rest] }
          })
          useNewPostsStore.getState().clear()
          scrollToStream(spec)
        })
      })
      .catch(() => undefined)
    return () => {
      cancelled = true
      useNewPostsStore.getState().clear()
    }
    // `spec` is described by `specKey`: callers pass a new object each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryClient, specKey])
}
