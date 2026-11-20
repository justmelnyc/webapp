'use client'

import { useEffect, type RefObject } from 'react'

/**
 * While the lightbox is open: `body.isLightBoxActive` (the original's `isLightBoxActive` flag, which
 * tucks the navbar and footer away) and keyboard focus inside the dialog, handed back on close.
 * Like the original, the page behind stays scrollable.
 */
export const useLightboxActive = (rootRef: RefObject<HTMLElement | null>): void => {
  useEffect(() => {
    const previous = document.activeElement
    document.body.classList.add('isLightBoxActive')
    rootRef.current?.focus({ preventScroll: true })
    return () => {
      document.body.classList.remove('isLightBoxActive')
      if (previous instanceof HTMLElement) previous.focus({ preventScroll: true })
    }
  }, [rootRef])
}
