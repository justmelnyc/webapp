import 'server-only'
import { restOrNull, restVoid } from '@/lib/api/client'
import { announcementEnvelopeSchema, type Announcement } from '@/types/announcement'

const PATH = '/api/v2/most_recent_announcements'

/** The newest announcement the viewer has not closed, or null. */
export const fetchAnnouncement = async (): Promise<Announcement | null> => {
  const data = await restOrNull(PATH, announcementEnvelopeSchema)
  return data?.announcements ?? null
}

/** The viewer closed the banner. */
export const markAnnouncementRead = async (): Promise<void> => restVoid(`${PATH}/mark_last_read_announcement`, { method: 'PATCH' })
