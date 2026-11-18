'use server'

import { errorMessage } from '@/lib/errors'
import { fetchAnnouncement, markAnnouncementRead } from '@/services/announcements'
import { hasNewNotifications, markNotificationsSeen } from '@/services/notifications'
import { failure, success, type ActionResult } from '@/types/action'
import type { Announcement } from '@/types/announcement'

/** Mark everything as seen (what the original does by loading the feed when the app starts). */
export const markNotificationsRead = async (): Promise<ActionResult> => {
  try {
    await markNotificationsSeen()
    return success(undefined)
  } catch (error) {
    return failure(errorMessage(error))
  }
}

/** The original's per-navigation check: is there anything new since the viewer last looked? */
export const checkForNewNotifications = async (): Promise<ActionResult<boolean>> => {
  try {
    return success(await hasNewNotifications())
  } catch (error) {
    return failure(errorMessage(error))
  }
}

/** The original's `loadAnnouncements`: asked on start and on each navigation. */
export const loadAnnouncement = async (): Promise<ActionResult<Announcement | null>> => {
  try {
    return success(await fetchAnnouncement())
  } catch (error) {
    return failure(errorMessage(error))
  }
}

/** Closing the banner tells the API, so it does not come back. */
export const closeAnnouncement = async (): Promise<ActionResult> => {
  try {
    await markAnnouncementRead()
    return success(undefined)
  } catch (error) {
    return failure(errorMessage(error))
  }
}
