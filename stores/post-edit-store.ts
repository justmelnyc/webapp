import { create } from 'zustand'
import type { EditablePostWithCategories } from '@/actions/post-edit-actions'

interface PostEditState {
  /** The post being edited inline, with the body the editor loads (the original's `post.isEditing`). */
  editing: EditablePostWithCategories | null
  begin: (post: EditablePostWithCategories) => void
  end: () => void
}

export const usePostEditStore = create<PostEditState>((set) => ({
  editing: null,
  begin: (editing) => set({ editing }),
  end: () => set({ editing: null }),
}))
