'use client'

import { useEffect, useState } from 'react'

/**
 * Calls `onEnter` whenever the returned ref's element is on screen.
 * Re-checks after `onEnter` changes, so a sentinel that stays visible keeps loading more.
 */
export const useInView = (onEnter: () => void, rootMargin = '600px') => {
  const [node, setNode] = useState<Element | null>(null)

  useEffect(() => {
    if (!node) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) onEnter()
      },
      { rootMargin },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [node, onEnter, rootMargin])

  return setNode
}
