import type { Announcement } from '@/types/announcement'
import { hasUnseenAnnouncement, useAnnouncementStore } from './announcement-store'

const announcement: Announcement = { id: '7', header: 'Hello' }

describe('announcement store', () => {
  beforeEach(() => useAnnouncementStore.setState({ announcement: null, lastSeenId: '0' }))

  it('lights the dot for an announcement nobody looked at, until it is seen', () => {
    const { setAnnouncement, markSeen } = useAnnouncementStore.getState()
    expect(hasUnseenAnnouncement(useAnnouncementStore.getState())).toBe(false)
    setAnnouncement(announcement)
    expect(hasUnseenAnnouncement(useAnnouncementStore.getState())).toBe(true)
    markSeen('7')
    expect(hasUnseenAnnouncement(useAnnouncementStore.getState())).toBe(false)
  })

  it('hides the banner when dismissed but remembers what was seen', () => {
    const { setAnnouncement, markSeen, dismiss } = useAnnouncementStore.getState()
    setAnnouncement(announcement)
    markSeen('7')
    dismiss()
    expect(useAnnouncementStore.getState()).toMatchObject({ announcement: null, lastSeenId: '7' })
  })
})
