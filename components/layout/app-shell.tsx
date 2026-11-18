'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { cn } from '@/utils/cn'
import styles from './app-shell.module.css'

interface AppShellState {
  isProfileMenuActive: boolean
  toggleProfileMenu: () => void
  closeProfileMenu: () => void
}

const AppShellContext = createContext<AppShellState | null>(null)

export const useAppShell = (): AppShellState => {
  const value = useContext(AppShellContext)
  if (!value) throw new Error('useAppShell must be used inside <AppShell>')
  return value
}

interface AppShellProps {
  isLoggedIn: boolean
  children: ReactNode
}

/**
 * The original's `section.AppContainer.isLoggedIn|isLoggedOut`: the root that the navbar, the main
 * view and the footer hang off, and the owner of the avatar menu state (`isProfileMenuActive`).
 */
export const AppShell = ({ isLoggedIn, children }: AppShellProps) => {
  const [isProfileMenuActive, setActive] = useState(false)
  const closeProfileMenu = useCallback(() => setActive(false), [])
  const toggleProfileMenu = useCallback(() => setActive((active) => !active), [])

  useEffect(() => {
    if (!isProfileMenuActive) return
    document.addEventListener('click', closeProfileMenu)
    return () => document.removeEventListener('click', closeProfileMenu)
  }, [isProfileMenuActive, closeProfileMenu])

  const value = useMemo(
    () => ({ isProfileMenuActive, toggleProfileMenu, closeProfileMenu }),
    [isProfileMenuActive, toggleProfileMenu, closeProfileMenu],
  )

  return (
    <AppShellContext value={value}>
      <section
        className={cn('AppContainer', styles.shell, isLoggedIn ? 'isLoggedIn' : 'isLoggedOut', isProfileMenuActive && 'isProfileMenuActive')}
      >
        {children}
      </section>
    </AppShellContext>
  )
}
