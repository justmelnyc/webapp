export interface Size {
  width: number
  height: number
}

/**
 * The room the original's `ImageRegion.setImageScale` leaves for a lightbox picture: the viewport
 * minus a padding that shrinks with it (80 / 60 / 40 / 20), three times that sideways (four on phones).
 */
export const paddedViewport = (viewport: Size): Size => {
  let padding = 80
  let multiplier = 3
  if (viewport.width < 1360) padding = 60
  if (viewport.width < 960) padding = 40
  if (viewport.width < 640) {
    padding = 20
    multiplier = 4
  }
  return { width: viewport.width - padding * multiplier, height: viewport.height - padding - 20 }
}

/**
 * Port of `setImageScale`: `measured` (the picture's whole-pixel size on screen) scaled so that a
 * picture shaped like `shape` fills the padded viewport, by height when it is the taller of the two.
 */
export const scaleToViewport = (shape: Size, measured: Size, viewport: Size): Size => {
  const inner = paddedViewport(viewport)
  const scale =
    shape.width / shape.height < inner.width / inner.height
      ? inner.height / shape.height
      : inner.width / shape.width
  return { width: measured.width * scale, height: measured.height * scale }
}

/**
 * After a viewport resize the original rescales from the current size, measured on screen in whole
 * pixels (`clientWidth` / `clientHeight`).
 */
export const rescaleToViewport = (current: Size, viewport: Size): Size =>
  scaleToViewport(current, { width: Math.round(current.width), height: Math.round(current.height) }, viewport)
