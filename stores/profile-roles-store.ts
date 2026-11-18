import { create } from 'zustand'

interface ProfileRolesState {
  /** The original's `gui.isProfileRolesActive`: whether the Community Roles panel is showing. */
  isOpen: boolean
  setOpen: (isOpen: boolean) => void
}

export const useProfileRolesStore = create<ProfileRolesState>((set) => ({
  isOpen: false,
  setOpen: (isOpen) => set({ isOpen }),
}))
