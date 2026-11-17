'use client'

import { useSyncExternalStore } from 'react'

/** Subscribes to a CSS media query; `false` on the server and during hydration. */
export const useMediaQuery = (query: string): boolean => {
  const subscribe = (notify: () => void): (() => void) => {
    const list = window.matchMedia(query)
    list.addEventListener('change', notify)
    return () => list.removeEventListener('change', notify)
  }
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  )
}
