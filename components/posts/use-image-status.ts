'use client'

import { useCallback, useState } from 'react'

/** The original's `ImageRegion` status classes; `null` once the picture is in. */
export type ImageStatus = 'isRequesting' | 'isFailing' | null

interface ImageStatusHandle {
  status: ImageStatus
  imageRef: (image: HTMLImageElement | null) => void
  onLoad: () => void
  onError: () => void
}

/**
 * Port of the `ImageRegion` / `ImageAsset` load tracking: a region is `isRequesting` (picture hidden,
 * placeholder colours moving behind a grid picture) until its picture loads, then fades it in, and is
 * `isFailing` when it cannot load. The original watches a second, off-screen `Image`; here the picture
 * on screen reports for itself, including one that finished before React attached its handlers.
 */
export const useImageStatus = (): ImageStatusHandle => {
  const [status, setStatus] = useState<ImageStatus>('isRequesting')
  const imageRef = useCallback((image: HTMLImageElement | null): void => {
    if (!image?.complete || !image.currentSrc) return
    setStatus(image.naturalWidth > 0 ? null : 'isFailing')
  }, [])
  const onLoad = useCallback((): void => setStatus(null), [])
  const onError = useCallback((): void => setStatus('isFailing'), [])
  return { status, imageRef, onLoad, onError }
}
