import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import heroStyles from '@/components/layout/hero.module.css'
import { AnnouncementBanner } from '@/components/notifications/announcement-banner'
import { NotificationPageList } from '@/components/notifications/notification-list'
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
  if ((type?.length ?? 0) > 1) notFound()
  // the original's route sends an unknown type back to the bare path
  if (segment !== undefined && !isNotificationTab(segment)) redirect('/notifications')
  const tab = isNotificationTab(segment) ? segment : 'all'
  await requireSession(`/notifications${segment ? `/${segment}` : ''}`)
  const initialPage = await fetchNotifications(tab)
  return (
    <>
      {/* The original's empty `.Hero`: its padding offsets the page below the fixed navbar. */}
      <div className={cn('Hero', heroStyles.frame)} />
      <div className="Notifications">
        {/* `/notifications/all` is the same feed, but no tab's own path: none is lit (TabListLinks compares paths) */}
        <NotificationTabLinks active={segment === 'all' ? null : tab} />
        <AnnouncementBanner />
        <NotificationPageList key={tab} tab={tab} initialPage={initialPage} assetOrigin={API_ORIGIN} />
      </div>
    </>
  )
}

export default NotificationsPage
