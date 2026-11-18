'use client'

import { CheckCircleIcon, StarIcon, XBoxIcon } from '@/components/icons'
import type { SubmissionAction, SubmissionActions, SubmissionStatus } from '@/types/artist-invite'
import { cn } from '@/utils/cn'
import { actionLabel } from '@/utils/artist-invite'
import styles from './admin-actions.module.css'

const Icon = ({ type }: { type: string }) => {
  switch (type) {
    case 'decline':
      return <XBoxIcon />
    case 'approve':
      return <CheckCircleIcon />
    case 'select':
      return <StarIcon />
    case 'unapprove':
      return (
        <>
          <CheckCircleIcon />
          <XBoxIcon />
        </>
      )
    case 'unselect':
      return (
        <>
          <StarIcon />
          <XBoxIcon />
        </>
      )
    default:
      return null
  }
}

interface AdminActionsProps {
  actions: SubmissionActions
  status: SubmissionStatus
  onAction: (action: SubmissionAction) => void
}

/** The curator's bar above a submission: accept, decline, select... (`PostAdminActions`). */
export const AdminActions = ({ actions, status, onAction }: AdminActionsProps) => (
  <div className={cn('post-admin-actions', styles.bar, status)}>
    {Object.entries(actions).map(([type, action]) =>
      action ? (
        <button
          key={type}
          type="button"
          className={cn(styles.action, styles[type], type)}
          data-label={actionLabel(action.label)}
          onClick={() => onAction(action)}
        >
          <Icon type={type} />
        </button>
      ) : null,
    )}
  </div>
)
