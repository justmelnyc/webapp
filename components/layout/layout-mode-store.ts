import { create } from 'zustand'

export type LayoutMode = 'list' | 'grid'

interface LayoutModeState {
  mode: LayoutMode
  toggle: () => void
}

/**
 * The original's list/grid switch (footer "Grid View" / "List View"). Streams that support a
 * grid layout read `mode` from here.
 */
export const useLayoutModeStore = create<LayoutModeState>((set) => ({
  mode: 'grid',
  toggle: () => set((state) => ({ mode: state.mode === 'grid' ? 'list' : 'grid' })),
}))
