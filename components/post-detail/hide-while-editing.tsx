'use client'

import type { ReactNode } from 'react'
import { usePostEditStore } from '@/stores/post-edit-store'
import { useRepostStore } from '@/stores/repost-store'

/** The original's `hasEditor`: the comment editor and list step aside while the post is being reposted or edited. */
export const HideWhileEditing = ({ postId, children }: { postId: string; children: ReactNode }) => {
  const reposting = useRepostStore((s) => s.postId === postId)
  const editing = usePostEditStore((s) => s.editing?.id === postId)
  return reposting || editing ? null : <>{children}</>
}
