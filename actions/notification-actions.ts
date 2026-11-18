'use server'

import { errorMessage } from '@/lib/errors'
import { hasNewNotifications, markNotificationsSeen } from '@/services/notifications'
import { failure, success, type ActionResult } from '@/types/action'

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
