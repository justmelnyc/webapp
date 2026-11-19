'use client'

import { useRouter } from 'next/navigation'
import { runSubmissionAction } from '@/actions/artist-invite-actions'
import { AdminActions } from '@/components/artist-invites/admin-actions'
import { toast } from '@/stores/toast-store'
import type { SubmissionAction } from '@/types/artist-invite'
import type { PostSubmission } from '@/types/post'
import styles from './submission-actions.module.css'

/**
 * The curator's bar on a submission's post page (the original's `PostAdminActions` inside
 * `.header-holder`). The page is reloaded after an action so both copies of the header agree.
 */
export const SubmissionActions = ({ submission }: { submission: PostSubmission }) => {
  const router = useRouter()
  if (!submission.actions) return null
  const run = (action: SubmissionAction): void => {
    void runSubmissionAction(action).then((result) => {
      if (!result.ok) return toast.error(result.error)
      router.refresh()
    })
  }
  return (
    <AdminActions actions={submission.actions} status={submission.status} onAction={run} className={styles.bar} />
  )
}
