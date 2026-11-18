import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { Announcement } from '@/types/announcement'

interface AnnouncementState {
  /** The banner above the notifications; null when there is none (or it was closed). */
  announcement: Announcement | null
  /** The last announcement the viewer looked at (the original's `gui.lastAnnouncementSeen`, kept in localStorage). */
  lastSeenId: string
  setAnnouncement: (announcement: Announcement | null) => void
  markSeen: (id: string) => void
  /** Closing hides it right away; the API call follows. */
  dismiss: () => void
}

export const useAnnouncementStore = create<AnnouncementState>()(
  persist(
    (set) => ({
      announcement: null,
      lastSeenId: '0',
      setAnnouncement: (announcement) => set({ announcement }),
      markSeen: (lastSeenId) => set({ lastSeenId }),
      dismiss: () => set({ announcement: null }),
    }),
    { name: 'ello-announcement', storage: createJSONStorage(() => localStorage), partialize: (state) => ({ lastSeenId: state.lastSeenId }) },
  ),
)

/** The bolt's red dot also lights for an announcement the viewer has not looked at yet. */
export const hasUnseenAnnouncement = (state: Pick<AnnouncementState, 'announcement' | 'lastSeenId'>): boolean =>
  !!state.announcement && state.announcement.id !== state.lastSeenId
