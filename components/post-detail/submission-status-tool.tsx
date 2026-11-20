import Link from 'next/link'
import { ArtistInviteSubmissionApprovedIcon, ArtistInviteSubmissionSelectedIcon } from '@/components/icons'
import type { PostSubmission } from '@/types/post'
import { Hint } from '@/components/posts/hint'
import styles from './submission-status-tool.module.css'

const BADGES = {
  approved: { icon: ArtistInviteSubmissionApprovedIcon, verb: 'Accepted' },
  selected: { icon: ArtistInviteSubmissionSelectedIcon, verb: 'Selected' },
} as const

/**
 * The original's `ArtistInviteSubmissionStatusTool`: the badge in a post's header for accepted and
 * selected submissions. Other statuses (unapproved, declined) show nothing, for the author too.
 */
export const SubmissionStatusTool = ({ submission }: { submission: PostSubmission }) => {
  const { status, artistInvite } = submission
  if (status !== 'approved' && status !== 'selected') return <span />
  const { icon: Icon, verb } = BADGES[status]
  return (
    <span className={`PostTool ArtistInviteSubmissionStatusTool ${styles.tool}`}>
      <Link href={`/invites/${artistInvite.slug}`}>
        <Icon />
        <Hint>{`${verb} Submission to ${artistInvite.title}`}</Hint>
      </Link>
    </span>
  )
}
