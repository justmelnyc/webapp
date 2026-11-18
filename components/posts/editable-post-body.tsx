'use client'

import type { ReactNode } from 'react'
import { InlinePostEditor } from '@/components/composer/inline-post-editor'
import { usePostEditStore } from '@/stores/post-edit-store'

/** The original's `showEditor`: while the post is being edited, the editor stands in for its body. */
export const EditablePostBody = ({ postId, children }: { postId: string; children: ReactNode }) => {
  const editing = usePostEditStore((s) => (s.editing?.id === postId ? s.editing : null))
  if (!editing) return <>{children}</>
  return <InlinePostEditor post={editing} />
}
