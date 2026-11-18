'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { deletePost } from '@/actions/composer-actions'
import { PencilIcon, XBoxIcon } from '@/components/icons'
import { useEditPost } from '@/components/posts/use-edit-post'
import { Hint } from '@/components/posts/hint'
import { toast } from '@/stores/toast-store'
import type { Post } from '@/types/post'

interface PostOwnerMenuProps {
  post: Pick<Post, 'id' | 'author'>
  viewerId: string | null | undefined
}

const DeleteTool = ({ postId }: { postId: string }) => {
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
    <span className="PostTool DeleteTool">
      <button type="button" onClick={onDelete} disabled={isPending} aria-label="Delete post">
        <XBoxIcon />
        <Hint>{isPending ? 'Deleting...' : 'Delete'}</Hint>
      </button>
    </span>
  )
}

const EditTool = ({ postId }: { postId: string }) => {
  const { edit, pending } = useEditPost(postId)
  return (
    <span className="PostTool EditTool">
      <button type="button" onClick={edit} disabled={pending} aria-label="Edit post">
        <PencilIcon />
        <Hint>Edit</Hint>
      </button>
    </span>
  )
}

/** Owner-only actions (the original's `DeleteTool`). Only the author's cards mount the controls. */
export const PostOwnerMenu = ({ post, viewerId }: PostOwnerMenuProps) => {
  if (!viewerId || viewerId !== post.author.id) return null
  return (
    <span>
      <EditTool postId={post.id} />
      <DeleteTool postId={post.id} />
    </span>
  )
}
