import 'server-only'
import { z } from 'zod'
import { graphql, restVoid } from '@/lib/api/client'
import { NEW_NOTIFICATIONS, NOTIFICATION_STREAM } from '@/constants/notification-queries'
import { sanitizeNotification } from '@/services/sanitize-notification'
import { notificationPageSchema, type NotificationPage, type NotificationTab } from '@/types/notification'

const streamEnvelope = z.object({ notificationStream: notificationPageSchema })
const newContentEnvelope = z.object({ newNotificationStreamContent: z.object({ newContent: z.boolean() }) })

/** One page of notifications. Loading the first page of a tab marks everything as seen (like the original API). */
export const fetchNotifications = async (tab: NotificationTab, before?: string | null): Promise<NotificationPage> => {
  const data = await graphql(NOTIFICATION_STREAM, { category: tab, before: before ?? undefined }, streamEnvelope)
  const page = data.notificationStream
  return { ...page, notifications: page.notifications.map(sanitizeNotification) }
}

/** True when something arrived since the viewer last looked. */
export const hasNewNotifications = async (): Promise<boolean> => {
  const data = await graphql(NEW_NOTIFICATIONS, {}, newContentEnvelope)
  return data.newNotificationStreamContent.newContent
}

export const markNotificationsSeen = async (): Promise<void> => restVoid('/api/v2/notifications/read', { method: 'POST' })
