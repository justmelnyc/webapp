/** Quartic in-out, the easing of the original's `scrollToPosition` (jello.js). */
export const quarticInOut = (t: number): number => (t < 0.5 ? 8 * t ** 4 : 1 - 8 * (1 - t) ** 4)

export const SCROLL_MS = 1000

/** Runs `apply` every frame from `from` to `to` over the original's second; returns a cancel. */
export const tween = (from: number, to: number, apply: (value: number) => void): (() => void) => {
  const start = performance.now()
  let frame = 0
  const step = (now: number): void => {
    const t = Math.min((now - start) / SCROLL_MS, 1)
    apply(from + (to - from) * quarticInOut(t))
    if (t < 1) frame = requestAnimationFrame(step)
  }
  frame = requestAnimationFrame(step)
  return () => cancelAnimationFrame(frame)
}

/** The original's `scrollToPosition(0, y)`: the window eases to `y`. */
export const scrollWindowTo = (y: number): (() => void) => tween(window.scrollY, y, (value) => window.scrollTo(0, value))

/**
 * The original's `scrollToSelector(selector, { boundary: 'bottom', offset })`: where the window has
 * to be for the element's bottom edge to sit `offset` pixels above the bottom of the viewport.
 */
export const bottomEdgeTarget = (rectBottom: number, scrollY: number, innerHeight: number, offset: number): number =>
  scrollY + (rectBottom - innerHeight) + offset
