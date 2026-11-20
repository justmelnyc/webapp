'use client'

import { useCallback, useEffect, useState } from 'react'
import { rescaleToViewport, scaleToViewport, type Size } from './image-scale'

const viewport = (): Size => ({ width: window.innerWidth, height: window.innerHeight })

export interface LightboxSizes {
  /** Scaled size per lightbox picture id; a picture without one still shows at its natural size. */
  sizes: Readonly<Record<string, Size>>
  /** Call when a picture has loaded (or a clip is on the page): measures it on screen and scales it to the viewport. */
  measure: (image: HTMLElement) => void
}

/** `ResizeComponent` waits this long after the last resize event (lodash `debounce`), then one frame. */
export const RESIZE_SETTLE = 100

const isSame = (a: Size, b: Size): boolean => a.width === b.width && a.height === b.height

/**
 * The picture sizes of the original's lightbox (`ImageRegion.setImageScale`): each one is measured
 * once at its natural size and scaled to fill the padded viewport, then rescaled once when the
 * viewport has changed. As in the original (`ResizeComponent` + `LightBoxContainer`), resize events
 * are debounced and a viewport that ends up the size it was is not a resize at all, so a transient
 * resize leaves every picture exactly as it was. `onResize` runs after a rescale (the original
 * re-centres the queue).
 */
export const useLightboxSizes = (onResize: () => void): LightboxSizes => {
  const [sizes, setSizes] = useState<Record<string, Size>>({})

  const measure = useCallback((image: HTMLElement): void => {
    const measured = { width: image.clientWidth, height: image.clientHeight }
    if (!measured.width || !measured.height) return
    // measured once: a picture that re-enters the queue keeps the size it was given
    setSizes((current) =>
      current[image.id] ? current : { ...current, [image.id]: scaleToViewport(measured, measured, viewport()) },
    )
  }, [])

  useEffect(() => {
    let seen = viewport()
    let timer: ReturnType<typeof setTimeout> | undefined
    let frame = 0
    const settle = (): void => {
      const next = viewport()
      if (isSame(next, seen)) return
      seen = next
      setSizes((current) =>
        Object.fromEntries(Object.entries(current).map(([id, size]) => [id, rescaleToViewport(size, next)])),
      )
      onResize()
    }
    const onWindowResize = (): void => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        cancelAnimationFrame(frame)
        frame = requestAnimationFrame(settle)
      }, RESIZE_SETTLE)
    }
    window.addEventListener('resize', onWindowResize)
    return () => {
      window.removeEventListener('resize', onWindowResize)
      clearTimeout(timer)
      cancelAnimationFrame(frame)
    }
  }, [onResize])

  return { sizes, measure }
}
