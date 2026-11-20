'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export type ScrollDirection = 'up' | 'down' | null

export interface ScrollTrack {
  lastY: number | null
  direction: ScrollDirection
}

/** ScrollComponent.getScrollDirection: the direction only changes on a jump of 20px or more between two frames. */
export const trackScroll = (track: ScrollTrack, scrollY: number): ScrollTrack => {
  const lastY = track.lastY ?? 0
  const direction = Math.abs(lastY - scrollY) >= 20 ? (scrollY > lastY ? 'down' : 'up') : track.direction
  return { lastY: scrollY, direction }
}

/**
 * ViewportContainer.onScroll: within the first screen (less the navbar's 80px) the bars always show; below
 * that they leave when the page is scrolled down and come back when it is scrolled up.
 */
export const isNavbarHiddenAfter = (isHidden: boolean, direction: ScrollDirection, scrollY: number, innerHeight: number): boolean => {
  if (scrollY < Math.round(innerHeight - 80)) return false
  if (!isHidden && direction === 'down') return true
  if (isHidden && direction === 'up') return false
  return isHidden
}

/** The original's `isNavbarHidden`: the navbar and the footer slide away while reading down a page. A new route shows them again. */
export const useNavbarHidden = (): boolean => {
  const pathname = usePathname()
  // remembered with the path it happened on, so that changing route resets it (the reducer's LOCATION_CHANGE)
  const [hiddenOn, setHiddenOn] = useState<string | null>(null)
  useEffect(() => {
    let track: ScrollTrack = { lastY: null, direction: null }
    let frame: number | null = null
    const onFrame = (): void => {
      frame = null
      const scrollY = Math.ceil(window.scrollY)
      track = trackScroll(track, scrollY)
      setHiddenOn((on) => (isNavbarHiddenAfter(on === pathname, track.direction, scrollY, window.innerHeight) ? pathname : null))
    }
    const onScroll = (): void => {
      frame ??= requestAnimationFrame(onFrame)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame !== null) cancelAnimationFrame(frame)
    }
  }, [pathname])
  return hiddenOn === pathname
}
