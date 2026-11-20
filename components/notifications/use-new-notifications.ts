'use client'

import { useEffect } from 'react'
import { useQueryClient, type InfiniteData } from '@tanstack/react-query'
import { fetchNotificationPage } from '@/lib/client/notifications'
import { useNewPostsStore } from '@/stores/new-posts-store'
import type { NotificationPage, NotificationTab } from '@/types/notification'

type NotificationData = InfiniteData<NotificationPage, string | null>

export const notificationsQueryKey = (tab: NotificationTab): readonly ['notifications', NotificationTab] => ['notifications', tab]

/**
 * The notifications page is a stream like any other in the original: opened again, it shows the feed it
 * already had, asks for the first page, and what is new waits behind the navbar's "New Posts" button
 * (`morePostIds` under the `/notifications` result). The dropdown is different: it reloads (NotificationList).
 */
export const useNewNotifications = (tab: NotificationTab): void => {
  const queryClient = useQueryClient()
  useEffect(() => {
    const queryKey = notificationsQueryKey(tab)
    let cancelled = false
    fetchNotificationPage(tab, null)
      .then((fresh) => {
        const current = queryClient.getQueryData<NotificationData>(queryKey)
        if (cancelled || !current) return
        const shown = new Set(current.pages.flatMap((page) => page.notifications.map((notification) => notification.id)))
        const unseen = fresh.notifications.filter((notification) => !shown.has(notification.id))
        if (unseen.length === 0) return
        useNewPostsStore.getState().offer(unseen.length, () => {
          queryClient.setQueryData<NotificationData>(queryKey, (old) => {
            const [first, ...rest] = old?.pages ?? []
            if (!old || !first) return old
            return { ...old, pages: [{ ...first, notifications: [...unseen, ...first.notifications] }, ...rest] }
          })
          useNewPostsStore.getState().clear()
          window.scrollTo({ top: 0 })
        })
      })
      .catch(() => undefined)
    return () => {
      cancelled = true
      useNewPostsStore.getState().clear()
    }
  }, [queryClient, tab])
}
