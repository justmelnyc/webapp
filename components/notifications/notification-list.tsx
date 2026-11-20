'use client'

import { useCallback, useEffect } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { ElloMark } from '@/components/icons'
import { AssetOriginProvider } from '@/components/ui/emoji'
import { PostPaginator } from '@/components/streams/post-paginator'
import { useInView } from '@/hooks/use-in-view'
import { fetchNotificationPage } from '@/lib/client/notifications'
import { useNotificationsStore } from '@/stores/notifications-store'
import type { NotificationPage, NotificationTab } from '@/types/notification'
import { NotificationItem } from './notification-item'
import { notificationKey } from './notification-parts'
import { notificationsQueryKey, useNewNotifications } from './use-new-notifications'
import '@/components/streams/stream.css'
import './notifications.css'

interface NotificationListProps {
  tab: NotificationTab
  /** First page rendered on the server (the page route); the dropdown loads it in the browser. */
  initialPage?: NotificationPage
  /** Where the API's static images (emoji) live. */
  assetOrigin: string
}

/** The navbar dropdown's list: every time it opens the feed is loaded again and what is new is simply there. */
export const NotificationList = (props: NotificationListProps) => <NotificationStream {...props} staleTime={0} />

/**
 * The notifications page's list. Opened again it keeps the feed it had and offers what is new behind the
 * navbar's "New Posts" button (see useNewNotifications), as the original does for every stream.
 */
export const NotificationPageList = (props: NotificationListProps) => {
  useNewNotifications(props.tab)
  return <NotificationStream {...props} staleTime={Infinity} />
}

/** The original's `StreamContainer` for notifications: a list that loads further pages on scroll. */
const NotificationStream = ({ tab, initialPage, assetOrigin, staleTime }: NotificationListProps & { staleTime: number }) => {
  const setUnread = useNotificationsStore((state) => state.setUnread)
  const query = useInfiniteQuery({
    queryKey: notificationsQueryKey(tab),
    queryFn: ({ pageParam }) => fetchNotificationPage(tab, pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => (last.isLastPage ? undefined : last.next),
    // Opening the feed marks everything as seen: the dropdown always looks again, the page leaves that to its hook
    staleTime,
    ...(initialPage ? { initialData: { pages: [initialPage], pageParams: [null] } } : {}),
  })
  const { hasNextPage, isFetchingNextPage, fetchNextPage, isSuccess } = query
  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) void fetchNextPage()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])
  const sentinel = useInView(loadMore, '200px')

  useEffect(() => {
    if (isSuccess) setUnread(false)
  }, [isSuccess, setUnread])

  if (query.isPending) {
    return (
      <section className="StreamContainer isFullWidth isBusy">
        <div className="StreamBusyIndicator">
          <ElloMark className="isSpinner" />
        </div>
      </section>
    )
  }
  const notifications = query.data?.pages.flatMap((page) => page.notifications) ?? []
  if (notifications.length === 0) {
    return (
      <section className="StreamContainer isFullWidth empty">
        <div className="ZeroState">Sorry, no notifications found.</div>
      </section>
    )
  }
  return (
    <section className="StreamContainer isFullWidth">
      <AssetOriginProvider value={assetOrigin}>
        <div className="Notifications">
          {notifications.map((notification, index) => (
            <NotificationItem key={notificationKey(notification, index)} data={notification} />
          ))}
        </div>
      </AssetOriginProvider>
      {hasNextPage && <PostPaginator isBusy={isFetchingNextPage} onLoadMore={loadMore} />}
      <div ref={sentinel} aria-hidden />
      {query.isError && <p role="alert">Couldn’t load more.</p>}
    </section>
  )
}
