'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef, type MouseEvent } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { checkForNewNotifications, loadAnnouncement } from '@/actions/notification-actions'
import { BoltIcon } from '@/components/icons'
import { NavbarIconLink } from '@/components/layout/navbar-link'
import { useMediaQuery } from '@/components/layout/use-media-query'
import { hasUnseenAnnouncement, useAnnouncementStore } from '@/stores/announcement-store'
import { useNotificationsStore } from '@/stores/notifications-store'
import { prefetchNotifications } from './prefetch-notifications'
import { cn } from '@/utils/cn'

/** Desktop and wider (`deviceSize === 'desktop'`: innerWidth > 959). Below it the header is truncated. */
export const DESKTOP_QUERY = '(min-width: 60em)'

/**
 * The navbar bolt. On desktop it toggles the dropdown; on smaller screens it goes to the page. It also
 * owns the red unread dot: the app marks everything seen on load, then asks the API on each navigation.
 */
export const NotificationsBoltLink = () => {
  const pathname = usePathname()
  const isDesktop = useMediaQuery(DESKTOP_QUERY)
  const { isActive, isUnread, activeTab, setActive, setUnread } = useNotificationsStore()
  const hasMounted = useRef(false)
  const queryClient = useQueryClient()
  const hasNewAnnouncement = useAnnouncementStore(hasUnseenAnnouncement)
  const setAnnouncement = useAnnouncementStore((state) => state.setAnnouncement)

  // The announcement is asked for on start and again on every navigation.
  useEffect(() => {
    void loadAnnouncement().then((result) => {
      if (result.ok) setAnnouncement(result.data)
    })
  }, [pathname, setAnnouncement])

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true
      // AppContainer loads the feed once when the app starts: that marks everything seen, and the dropdown
      // has its list the moment it is first opened (the notifications page brings its own first page)
      if (!pathname.startsWith('/notifications')) void prefetchNotifications(queryClient)
      return
    }
    // Looking at the feed already marks it seen, so only ask elsewhere.
    if (pathname.startsWith('/notifications')) return
    void checkForNewNotifications().then((result) => {
      if (result.ok) setUnread(result.data)
    })
  }, [pathname, setUnread, queryClient])

  const onClick = (event: MouseEvent<HTMLAnchorElement>): void => {
    if (!isDesktop) return
    event.preventDefault()
    setActive(!isActive)
  }
  const href = pathname.startsWith('/notifications') ? '/notifications' : `/notifications/${activeTab}`
  return (
    <NavbarIconLink
      href={href}
      label="Notifications"
      icon={<BoltIcon />}
      className={cn((isUnread || hasNewAnnouncement) && 'isNotificationsUnread')}
      onClick={onClick}
    />
  )
}
