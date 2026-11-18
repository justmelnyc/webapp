import { notificationPageSchema, type NotificationPage, type NotificationTab } from '@/types/notification'

/** Browser-side fetch of one page of notifications via the /api/notifications route handler. */
export const fetchNotificationPage = async (tab: NotificationTab, before: string | null): Promise<NotificationPage> => {
  const params = new URLSearchParams({ tab })
  if (before) params.set('before', before)
  const response = await fetch(`/api/notifications?${params}`)
  if (!response.ok) throw new Error('Could not load notifications')
  return notificationPageSchema.parse(await response.json())
}
