'use client'

import { createContext, useContext } from 'react'

export interface LightboxApi {
  /** The original's `toggleLightBox(assetId, postId)`: open on that picture, move to it, or close when it is the selected one. */
  toggle: (assetId: string, postId: string) => void
}

export const LightboxContext = createContext<LightboxApi | null>(null)

/** The nearest lightbox (a stream's, a post page's, a comment list's); `null` where pictures have none. */
export const useLightbox = (): LightboxApi | null => useContext(LightboxContext)
