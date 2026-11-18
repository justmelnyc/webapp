import { useEffect } from 'react'

/** Quartic in-out, the easing of the original's `scrollToPosition` (jello.js). */
const quarticInOut = (t: number): number => (t < 0.5 ? 8 * t ** 4 : 1 - 8 * (1 - t) ** 4)

const SCROLL_MS = 1000

const tween = (from: number, to: number, apply: (value: number) => void): (() => void) => {
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

/**
 * The original's `RepostBlock.scrollToRepostActions`: once the editor is mounted (after 1s in a grid,
 * 0.5s in a list, to let images settle) scroll so the action bar sits a quarter of the way down.
 * On post detail the inner `.PostList` scrolls instead of the window.
 */
export const useScrollToRepostActions = (actionsId: string, isGrid: boolean): void => {
  useEffect(() => {
    let cancel = (): void => {}
    const timer = window.setTimeout(() => {
      const actions = document.getElementById(actionsId)
      if (!actions) return
      const list = document.querySelector<HTMLElement>('.PostList')
      const detail = !!document.querySelector('.PostSideBar') && !!list
      const top = detail ? actions.offsetTop : actions.getBoundingClientRect().top + window.scrollY
      const target = top - window.innerHeight / 4
      cancel = detail && list
        ? tween(list.scrollTop, target, (y) => { list.scrollTop = y })
        : tween(window.scrollY, target, (y) => window.scrollTo(0, y))
    }, isGrid ? 1000 : 500)
    return () => {
      window.clearTimeout(timer)
      cancel()
    }
  }, [actionsId, isGrid])
}
