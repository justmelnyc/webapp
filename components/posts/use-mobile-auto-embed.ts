'use client'

import { useEffect, useState, type RefObject } from 'react'

/** embetter's `isMobile` test. */
const MOBILE = /iphone|ipad|ipod|android/
/** embetter waits this long after the last scroll event before it looks. */
const SETTLE_MS = 500

/**
 * embetter's `scrollListener`: on phones and tablets a player is put in place (without autoplay) once
 * its thumbnail is entirely on screen and taken out again when it is not, so one tap plays it.
 * Returns whether the player should be in place; `onLeave` runs each time the embed is found off screen.
 */
export const useMobileAutoEmbed = (ref: RefObject<HTMLElement | null>, enabled: boolean, onLeave: () => void): boolean => {
  const [inView, setInView] = useState(false)
  useEffect(() => {
    if (!enabled || !MOBILE.test(navigator.userAgent.toLowerCase())) return undefined
    let timer: ReturnType<typeof setTimeout> | undefined
    const look = (): void => {
      const rect = ref.current?.getBoundingClientRect()
      const visible = !!rect && rect.bottom < window.innerHeight && rect.top > 0
      setInView(visible)
      if (!visible) onLeave()
    }
    const onScroll = (): void => {
      clearTimeout(timer)
      timer = setTimeout(look, SETTLE_MS)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    // embetter nudges the page by a pixel on load to get a first look
    onScroll()
    return () => {
      clearTimeout(timer)
      window.removeEventListener('scroll', onScroll)
    }
  }, [ref, enabled, onLeave])
  return inView
}
