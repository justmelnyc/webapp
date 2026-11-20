'use client'

import { useEffect } from 'react'
import { useStreamCommentsStore } from '@/stores/stream-comments-store'
import { bottomEdgeTarget, scrollWindowTo } from '@/utils/scroll-to-position'

/** `scrollToSelector('.TabListStreamContainer', { boundary: 'bottom', offset: 200 })` */
const OFFSET = 200

/**
 * The original's `PostDetailContainer.componentDidMount`: a post page reached through a stream's
 * "See More" eases the window down until the comments' bottom edge is 200px above the bottom of the
 * viewport. It is a window scroll, so from 60em up (where the side bar scrolls, not the window)
 * nothing moves, as in the original.
 */
export const useSeeMoreScroll = (postId: string): void => {
  useEffect(() => {
    let cancel = (): void => {}
    const frame = requestAnimationFrame(() => {
      if (!useStreamCommentsStore.getState().takeSeeMore(postId)) return
      const comments = document.querySelector('.TabListStreamContainer')
      if (!comments) return
      const { bottom } = comments.getBoundingClientRect()
      cancel = scrollWindowTo(bottomEdgeTarget(bottom, window.scrollY, window.innerHeight, OFFSET))
    })
    return () => {
      cancelAnimationFrame(frame)
      cancel()
    }
  }, [postId])
}
