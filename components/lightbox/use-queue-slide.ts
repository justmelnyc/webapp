'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, type RefObject } from 'react'
import type { Direction, LightboxPair, Pagination } from './lightbox-queue'
import { lightboxAssetDomId } from './scroll-to-asset'

/** Delays of the original's LightBoxContainer; opening from a grid waits for the posts to render. */
export const OPEN_DELAY = { list: 200, grid: 1250 } as const
const ADVANCE_DELAY = 100
const RESIZE_DELAY = 250

/** Port of `slideQueue`'s measuring: the queue offset that puts `pair` in the middle of the viewport. */
const offsetFor = (queue: HTMLElement, pair: LightboxPair): number | null => {
  const asset = document.getElementById(lightboxAssetDomId(pair))
  if (!asset) return null
  const box = asset.getBoundingClientRect()
  return (window.innerWidth - box.width) / 2 - (box.left - queue.getBoundingClientRect().left)
}

interface Options {
  queueRef: RefObject<HTMLDivElement | null>
  selected: LightboxPair
  pagination: Pagination
  direction: Direction
  /** First item drawn in the queue; when it changes, items were added or removed at the front. */
  oldestItemId: string | undefined
  /** How long after opening the queue first moves (`OPEN_DELAY`). */
  openDelay: number
}

export interface QueueSlide {
  /** Re-centre without animation shortly after the viewport changed size. */
  recenterAfterResize: () => void
  /** Re-centre without animation now (a picture got its size after the queue had moved). */
  recenter: () => void
}

/**
 * Moves the queue so the selected picture is centred, like the original: a moment after the
 * selection changes, animated (the `transition` class) except when the queue only makes up for
 * items that came or went at its front.
 */
export const useQueueSlide = ({ queueRef, selected, pagination, direction, oldestItemId, openDelay }: Options): QueueSlide => {
  const latest = useRef({ selected, pagination, direction })
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>())
  const hasSlid = useRef(false)
  const openedOn = useRef(lightboxAssetDomId(selected))
  const previousOldest = useRef(oldestItemId)

  const slideTo = useCallback((pair: LightboxPair | null, animate: boolean): void => {
    const queue = queueRef.current
    const offset = queue && pair ? offsetFor(queue, pair) : null
    if (!queue || offset === null) return
    queue.classList.toggle('transition', animate)
    queue.style.transform = `translateX(${offset}px)`
  }, [queueRef])

  const later = useCallback((run: () => void, delay: number): void => {
    const timer = setTimeout(() => {
      timers.current.delete(timer)
      run()
    }, delay)
    timers.current.add(timer)
  }, [])

  useEffect(() => {
    const pending = timers.current
    return () => pending.forEach(clearTimeout)
  }, [])

  // items appeared or left at the front: keep the picture that was showing where it is
  useLayoutEffect(() => {
    latest.current = { selected, pagination, direction }
    if (previousOldest.current === oldestItemId) return
    previousOldest.current = oldestItemId
    if (hasSlid.current) slideTo(direction === 'next' ? pagination.prev : pagination.next, false)
  })

  // the selection changed (or the lightbox just opened): slide to it after the original's delay
  const selectedId = lightboxAssetDomId(selected)
  useEffect(() => {
    const isOpening = !hasSlid.current && selectedId === openedOn.current
    later(() => {
      hasSlid.current = true
      slideTo(latest.current.selected, true)
    }, isOpening ? openDelay : ADVANCE_DELAY)
  }, [selectedId, openDelay, later, slideTo])

  const recenter = useCallback((): void => {
    if (hasSlid.current) slideTo(latest.current.selected, false)
  }, [slideTo])
  const recenterAfterResize = useCallback((): void => later(recenter, RESIZE_DELAY), [later, recenter])

  return { recenter, recenterAfterResize }
}
