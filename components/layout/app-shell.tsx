'use client'

import { useRouter } from 'next/navigation'
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type MouseEvent, type ReactNode } from 'react'
import { useNotificationsStore } from '@/stores/notifications-store'
import { cn } from '@/utils/cn'
import { hashtagPath } from '@/utils/hashtag-link'
import styles from './app-shell.module.css'
import { useNavbarHidden } from './use-navbar-hidden'

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
  const router = useRouter()
  const isNavbarHidden = useNavbarHidden()
  const isNotificationsActive = useNotificationsStore((state) => state.isActive)
  const closeProfileMenu = useCallback(() => setActive(false), [])
  const toggleProfileMenu = useCallback(() => setActive((active) => !active), [])

  useEffect(() => {
    if (!isProfileMenuActive) return
    document.addEventListener('click', closeProfileMenu)
    return () => document.removeEventListener('click', closeProfileMenu)
  }, [isProfileMenuActive, closeProfileMenu])

  // Like the original's `onClickRenderedContent`: hashtags in rendered text are spans, so push their path
  const onClick = useCallback((event: MouseEvent<HTMLElement>) => {
    const path = hashtagPath(event.target)
    if (!path) return
    event.preventDefault()
    router.push(path)
  }, [router])

  const value = useMemo(
    () => ({ isProfileMenuActive, toggleProfileMenu, closeProfileMenu }),
    [isProfileMenuActive, toggleProfileMenu, closeProfileMenu],
  )

  return (
    <AppShellContext value={value}>
      <section
        onClick={onClick}
        className={cn('AppContainer', styles.shell, isLoggedIn ? 'isLoggedIn' : 'isLoggedOut', isProfileMenuActive && 'isProfileMenuActive', isNavbarHidden && 'isNavbarHidden')}
      >
        {/* the original's `Viewport`: an empty element whose classes the bars after it are styled by */}
        <div className={cn('Viewport', isNotificationsActive && 'isNotificationsActive')} />
        {children}
      </section>
    </AppShellContext>
  )
}
