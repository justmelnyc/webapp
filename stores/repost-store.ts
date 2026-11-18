import { create } from 'zustand'

interface RepostState {
  /** The post whose inline repost editor is open (the original's `isReposting`); one at a time. */
  postId: string | null
  start: (postId: string) => void
  stop: () => void
}

export const useRepostStore = create<RepostState>((set) => ({
  postId: null,
  start: (postId) => set({ postId }),
  stop: () => set({ postId: null }),
}))
