'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { deletePost } from '@/actions/composer-actions'
import { PencilIcon, XBoxIcon } from '@/components/icons'
import { toast } from '@/stores/toast-store'
import { useEditPost } from '@/components/posts/use-edit-post'
import { Hint } from '@/components/posts/hint'

/** The header's DeleteTool, shown on the viewer's own posts. */
export const OwnerTools = ({ postId }: { postId: string }) => {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const { edit, pending: editing } = useEditPost(postId)

  const remove = () => {
    if (!window.confirm('Delete this post? This cannot be undone.')) return
    startTransition(async () => {
      const result = await deletePost(postId)
      if (!result.ok) return toast.error(result.error)
      toast.success('Post deleted')
      router.push('/')
      router.refresh()
    })
  }

  return (
    <span>
      <span className="PostTool EditTool">
        <button type="button" onClick={edit} disabled={editing} aria-label="Edit post">
          <PencilIcon />
          <Hint>Edit</Hint>
        </button>
      </span>
      <span className="PostTool DeleteTool">
        <button type="button" onClick={remove} disabled={pending} aria-label="Delete post">
          <XBoxIcon />
          <Hint>Delete</Hint>
        </button>
      </span>
    </span>
  )
}
