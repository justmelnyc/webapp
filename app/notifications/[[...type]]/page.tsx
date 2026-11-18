import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import heroStyles from '@/components/layout/hero.module.css'
import { AnnouncementBanner } from '@/components/notifications/announcement-banner'
import { NotificationList } from '@/components/notifications/notification-list'
import { NotificationTabLinks } from '@/components/notifications/notification-tabs'
import { API_ORIGIN } from '@/lib/env'
import { requireSession } from '@/lib/require-session'
import { fetchNotifications } from '@/services/notifications'
import { isNotificationTab } from '@/types/notification'
import { cn } from '@/utils/cn'

export const metadata: Metadata = { title: 'Notifications' }

const NotificationsPage = async ({ params }: { params: Promise<{ type?: string[] }> }) => {
  const { type } = await params
  const segment = type?.[0]
  if ((type?.length ?? 0) > 1 || (segment !== undefined && !isNotificationTab(segment))) notFound()
  const tab = isNotificationTab(segment) ? segment : 'all'
  await requireSession(`/notifications${segment ? `/${segment}` : ''}`)
  const initialPage = await fetchNotifications(tab)
  return (
    <>
      {/* The original's empty `.Hero`: its padding offsets the page below the fixed navbar. */}
      <div className={cn('Hero', heroStyles.frame)} />
      <div className="Notifications">
        <NotificationTabLinks active={tab} />
        <AnnouncementBanner />
        <NotificationList key={tab} tab={tab} initialPage={initialPage} assetOrigin={API_ORIGIN} />
      </div>
    </>
  )
}

export default NotificationsPage
