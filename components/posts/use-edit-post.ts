'use client'

import { useTransition } from 'react'
import { loadEditablePost } from '@/actions/post-edit-actions'
import { usePostEditStore } from '@/stores/post-edit-store'
import { toast } from '@/stores/toast-store'

/** The header EditTool's behavior (own posts): load the editable post, then its body turns into the editor. */
export const useEditPost = (postId: string): { edit: () => void; pending: boolean } => {
  const [pending, startTransition] = useTransition()
  const edit = (): void => {
    startTransition(async () => {
      const result = await loadEditablePost(postId)
      if (!result.ok) return toast.error(result.error)
      usePostEditStore.getState().begin(result.data)
    })
  }
  return { edit, pending }
}
