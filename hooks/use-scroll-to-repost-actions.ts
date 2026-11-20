import { useEffect } from 'react'
import { tween } from '@/utils/scroll-to-position'

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
