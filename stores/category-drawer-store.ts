import { create } from 'zustand'

interface CategoryDrawerState {
  /** The original's `gui.isCategoryDrawerOpen`: whether a category page shows its info panel. Kept while browsing, not saved. */
  isOpen: boolean
  setOpen: (isOpen: boolean) => void
}

export const useCategoryDrawerStore = create<CategoryDrawerState>((set) => ({
  isOpen: false,
  setOpen: (isOpen) => set({ isOpen }),
}))
