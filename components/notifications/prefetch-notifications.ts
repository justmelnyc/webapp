import type { QueryClient } from '@tanstack/react-query'
import { fetchNotificationPage } from '@/lib/client/notifications'
import type { NotificationPage } from '@/types/notification'
import { notificationsQueryKey } from './use-new-notifications'

/** The key the lists read the "All" tab from. */
export const ALL_NOTIFICATIONS_KEY = notificationsQueryKey('all')

/**
 * The original loads the "All" feed when the app starts (`AppContainer`), before anyone opens it. Doing the
 * same here marks the feed seen on the API and puts its first page where the dropdown's list finds it.
 * A failure is not reported: the list asks again when it is opened.
 */
export const prefetchNotifications = (
  queryClient: QueryClient,
  fetchPage: (tab: 'all', before: string | null) => Promise<NotificationPage> = fetchNotificationPage,
): Promise<void> =>
  queryClient.prefetchInfiniteQuery({
    queryKey: ALL_NOTIFICATIONS_KEY,
    queryFn: ({ pageParam }) => fetchPage('all', pageParam),
    initialPageParam: null as string | null,
  })
