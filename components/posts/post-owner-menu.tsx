'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { deletePost } from '@/actions/composer-actions'
import { TextButton } from '@/components/ui/button'
import { toast } from '@/stores/toast-store'
import type { Post } from '@/types/post'

interface PostOwnerMenuProps {
  post: Pick<Post, 'id' | 'author'>
  viewerId: string | null | undefined
}

const DeleteControl = ({ postId }: { postId: string }) => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const onDelete = (): void => {
    if (!window.confirm('Delete this post? This cannot be undone.')) return
    startTransition(async () => {
      const result = await deletePost(postId)
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success('Post deleted')
      router.refresh()
    })
  }

  return (
    <TextButton onClick={onDelete} disabled={isPending} aria-label="Delete post">
      {isPending ? 'Deleting...' : 'Delete'}
    </TextButton>
  )
}

/** Owner-only actions. Only the author's cards mount the controls (and their hooks). */
export const PostOwnerMenu = ({ post, viewerId }: PostOwnerMenuProps) => {
  if (!viewerId || viewerId !== post.author.id) return null
  return <DeleteControl postId={post.id} />
}
