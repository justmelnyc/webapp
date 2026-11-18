'use client'

import type { ReactNode } from 'react'
import { RepostEditor } from '@/components/posts/repost-editor'
import { useRepostStore } from '@/stores/repost-store'
import type { Post } from '@/types/post'

/** Swaps a post's body for the inline repost editor while it is open (the original's `showEditor`). */
export const RepostEditorGate = ({ post, children }: { post: Post; children: ReactNode }) => {
  const activeId = useRepostStore((s) => s.postId)
  return activeId === post.id ? <RepostEditor post={post} /> : <>{children}</>
}
