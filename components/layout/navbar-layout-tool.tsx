'use client'

import { GridIcon, ListIcon } from '@/components/icons'
import { isLayoutToolHidden } from './layout-routes'
import { useLayoutModeStore } from './layout-mode-store'
import styles from './navbar.module.css'
import { useShownPath } from './use-pending-navigation'

/** List/grid switch shown in the navbar below 60em (the footer carries it on desktop). */
export const NavbarLayoutTool = () => {
  const pathname = useShownPath()
  const mode = useLayoutModeStore((state) => state.mode)
  const toggle = useLayoutModeStore((state) => state.toggle)
  if (isLayoutToolHidden(pathname)) return null
  return (
    <button
      type="button"
      className={styles.layoutTool}
      onClick={toggle}
      aria-label={mode === 'grid' ? 'List view' : 'Grid view'}
    >
      {mode === 'grid' ? <ListIcon /> : <GridIcon />}
    </button>
  )
}
