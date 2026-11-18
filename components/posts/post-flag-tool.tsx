'use client'

import { useState } from 'react'
import { flagPost } from '@/actions/moderation-actions'
import { FlagIcon } from '@/components/icons'
import { FlagDialog } from '@/components/moderation/flag-dialog'
import { Hint } from '@/components/posts/hint'
import '@/components/posts/post-hints.css'
import '@/components/posts/post-tools.css'
import '@/components/posts/post-tools-more.css'

/** The original's `FlagTool` (Report Post): opens the flag dialog. Shown to signed in readers on other people's posts. */
export const PostFlagTool = ({ postId }: { postId: string }) => {
  const [open, setOpen] = useState(false)
  const report = async (kind: string): Promise<string | null> => {
    const result = await flagPost(postId, kind)
    return result.ok ? null : result.error
  }
  return (
    <span className="PostTool FlagTool ShyTool">
      <button type="button" aria-label="Report post" onClick={() => setOpen(true)}>
        <FlagIcon />
        <Hint className="Flag">Report Post</Hint>
      </button>
      {open ? <FlagDialog onSubmit={report} onDismiss={() => setOpen(false)} /> : null}
    </span>
  )
}
