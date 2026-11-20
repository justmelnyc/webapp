import { create } from 'zustand'

/** How a post's inline comments were opened: by its own comment tool, or from the lightbox. */
export type StreamCommentsOrigin = 'tool' | 'lightbox'

interface StreamCommentsState {
  /**
   * Posts whose comments are open under them in a stream (the original's `post.showComments`).
   * Several can be open at once and they stay open while the viewer moves around the app.
   */
  open: Record<string, StreamCommentsOrigin>
  /** The post's comment tool: open, or close again. */
  toggle: (postId: string) => void
  /** The lightbox's comment tool: always open (`PostLightBoxContainer.onClickToggleComments`). */
  show: (postId: string) => void
  /**
   * The post whose "See More" was just followed (the original's `location.state.from ===
   * 'PaginatorLink'`): its page scrolls down to the comments once, when it opens.
   */
  seeMore: string | null
  followSeeMore: (postId: string) => void
  /** True once for the post "See More" led to. */
  takeSeeMore: (postId: string) => boolean
}

export const useStreamCommentsStore = create<StreamCommentsState>((set, get) => ({
  open: {},
  seeMore: null,
  followSeeMore: (postId) => set({ seeMore: postId }),
  takeSeeMore: (postId) => {
    if (get().seeMore !== postId) return false
    set({ seeMore: null })
    return true
  },
  toggle: (postId) =>
    set(({ open }) => {
      if (!open[postId]) return { open: { ...open, [postId]: 'tool' } }
      return { open: Object.fromEntries(Object.entries(open).filter(([id]) => id !== postId)) }
    }),
  show: (postId) => set(({ open }) => (open[postId] ? { open } : { open: { ...open, [postId]: 'lightbox' } })),
}))
