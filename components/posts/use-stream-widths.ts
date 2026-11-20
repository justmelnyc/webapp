'use client'

import { useSyncExternalStore } from 'react'
import { useColumnCount } from '@/components/streams/use-column-count'
import { isIOS, streamWidths, type StreamWidths } from '@/utils/image-region'

const onResize = (notify: () => void): (() => void) => {
  window.addEventListener('resize', notify)
  return () => window.removeEventListener('resize', notify)
}

const never = (): (() => void) => () => undefined

/** The widths the original sizes video attachments from (its `gui` selectors); zeros on the server. */
export const useStreamWidths = (): StreamWidths => {
  const columnCount = useColumnCount()
  const innerWidth = useSyncExternalStore(onResize, () => window.innerWidth, () => 0)
  return streamWidths(innerWidth, columnCount)
}

/**
 * Whether this browser gets the clip of a video attachment (the original's `!isIOS()`). The server
 * cannot know, so the still is rendered first and the clip takes over once the page is live.
 */
export const useCanPlayClips = (): boolean =>
  useSyncExternalStore(never, () => !isIOS(navigator.userAgent), () => false)
