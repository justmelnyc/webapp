'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useMediaQuery } from '@/components/layout/use-media-query'
import { useNotificationsStore } from '@/stores/notifications-store'
import type { NotificationTab } from '@/types/notification'
import { DESKTOP_QUERY } from './notifications-bolt-link'
import { NotificationList } from './notification-list'
import { NotificationTabButtons } from './notification-tabs'
import './notifications.css'

const setScrolling = (on: boolean): void => {
  document.body.classList.toggle('isNotificationsScrolling', on)
}

/** The original's `<NotificationsContainer isModal />`: tabs and a scrollable feed under the navbar. */
const Dropdown = () => {
  const { activeTab, setActive, setActiveTab } = useNotificationsStore()
  const queryClient = useQueryClient()

  // Clicking anywhere outside closes it. Registered a tick late so the opening click does not close it again.
  useEffect(() => {
    const onDocument = (event: Event): void => {
      if (event.target instanceof Element && event.target.closest('.NotificationsContainer')) return
      setActive(false)
      setScrolling(false)
    }
    const timer = setTimeout(() => {
      document.addEventListener('click', onDocument)
      document.addEventListener('touchstart', onDocument)
    }, 0)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('click', onDocument)
      document.removeEventListener('touchstart', onDocument)
      setScrolling(false)
    }
  }, [setActive])

  const onSelect = (tab: NotificationTab): void => {
    // The active tab again reloads it, like the original.
    if (tab === activeTab) void queryClient.resetQueries({ queryKey: ['notifications', tab] })
    else setActiveTab(tab)
  }

  return (
    <div className="NotificationsContainer" onMouseEnter={() => setScrolling(true)} onMouseLeave={() => setScrolling(false)}>
      <NotificationTabButtons active={activeTab} onSelect={onSelect} />
      <div className="Scrollable">
        <NotificationList key={activeTab} tab={activeTab} />
      </div>
    </div>
  )
}

/** Renders the dropdown while it is open (desktop only; smaller screens use the page). */
export const NotificationsDropdown = () => {
  const isActive = useNotificationsStore((state) => state.isActive)
  const isDesktop = useMediaQuery(DESKTOP_QUERY)
  return isActive && isDesktop ? <Dropdown /> : null
}
