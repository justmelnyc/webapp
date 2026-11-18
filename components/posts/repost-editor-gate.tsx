'use client'

import type { ReactNode } from 'react'
import { RepostEditor } from '@/components/posts/repost-editor'
import { useRepostStore } from '@/stores/repost-store'
import type { Post } from '@/types/post'
import type { RepostLayout } from '@/components/posts/repost-editor'

/** Swaps a post's body for the inline repost editor while it is open (the original's `showEditor`). */
interface RepostEditorGateProps {
  post: Post
  /** Where the post is shown: a grid card gets the compact editor. */
  layout: RepostLayout
  children: ReactNode
}

export const RepostEditorGate = ({ post, layout, children }: RepostEditorGateProps) => {
  const activeId = useRepostStore((s) => s.postId)
  return activeId === post.id ? <RepostEditor post={post} layout={layout} /> : <>{children}</>
}
