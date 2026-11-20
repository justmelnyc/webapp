'use client'

import { useState } from 'react'
import { flagComment } from '@/actions/moderation-actions'
import { FlagIcon } from '@/components/icons'
import { FlagDialog } from '@/components/moderation/flag-dialog'
import { Hint } from '@/components/posts/hint'
import { cn } from '@/utils/cn'

interface CommentFlagToolProps {
  postId: string
  commentId: string
  className?: string
}

/** The original's comment `FlagTool`: opens the same FlagDialog the posts use. For other people's comments. */
export const CommentFlagTool = ({ postId, commentId, className }: CommentFlagToolProps) => {
  const [open, setOpen] = useState(false)
  const report = async (kind: string): Promise<string | null> => {
    const result = await flagComment(postId, commentId, kind)
    return result.ok ? null : result.error
  }
  return (
    <span className={cn('PostTool FlagTool', className)}>
      <button type="button" aria-label="Flag comment" onClick={() => setOpen(true)}>
        <FlagIcon />
        <Hint>Flag</Hint>
      </button>
      {open ? <FlagDialog onSubmit={report} onDismiss={() => setOpen(false)} /> : null}
    </span>
  )
}
