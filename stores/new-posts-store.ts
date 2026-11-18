import { create } from 'zustand'

interface NewPostsState {
  /** How many posts arrived at the top of the stream on this page since it loaded (the original's `morePostIds`). */
  count: number
  /** Adds them to the stream; set by the stream that has them. */
  apply: (() => void) | null
  offer: (count: number, apply: () => void) => void
  /** The stream was left (or the posts were taken): nothing is waiting. */
  clear: () => void
}

export const useNewPostsStore = create<NewPostsState>((set) => ({
  count: 0,
  apply: null,
  offer: (count, apply) => set({ count, apply }),
  clear: () => set({ count: 0, apply: null }),
}))
