import { create } from 'zustand'
import type { NotificationTab } from '@/types/notification'

interface NotificationsState {
  /** The navbar dropdown is open. */
  isActive: boolean
  /** The red dot on the bolt: something arrived since the viewer last looked. */
  isUnread: boolean
  /** Last tab used in the dropdown / page; the bolt link goes back to it. */
  activeTab: NotificationTab
  setActive: (isActive: boolean) => void
  setUnread: (isUnread: boolean) => void
  setActiveTab: (tab: NotificationTab) => void
}

export const useNotificationsStore = create<NotificationsState>((set) => ({
  isActive: false,
  isUnread: false,
  activeTab: 'all',
  setActive: (isActive) => set({ isActive }),
  setUnread: (isUnread) => set({ isUnread }),
  setActiveTab: (activeTab) => set({ activeTab }),
}))
