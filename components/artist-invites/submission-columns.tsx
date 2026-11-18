import { EditablePostBody } from '@/components/posts/editable-post-body'
import { PostCard } from '@/components/posts/post-card'
import { PostContent } from '@/components/posts/post-content'
import type { Submission, SubmissionAction } from '@/types/artist-invite'
import { cn } from '@/utils/cn'
import { AdminActions } from './admin-actions'
import styles from './submissions.module.css'

interface ItemProps {
  submission: Submission
  mode: 'grid' | 'list'
  signedIn: boolean
  viewerId?: string | null
  eager: boolean
  onAction: (submission: Submission, action: SubmissionAction) => void
}

/** One submission: the post, with the curator's bar between its header and body when the API allows actions. */
const SubmissionPost = ({ submission, mode, signedIn, viewerId, eager, onAction }: ItemProps) => {
  const { post, actions, status } = submission
  return (
    <div className={cn(mode === 'grid' ? 'PostGrid' : 'PostList', 'ArtistInviteSubmission', mode === 'list' && styles.listItem)}>
      <PostCard>
        <PostCard.Header post={post} viewerId={viewerId} />
        {actions && <AdminActions actions={actions} status={status} onAction={(action) => onAction(submission, action)} />}
        <PostCard.Body>
          <EditablePostBody postId={post.id}>
            <PostContent post={post} mode={mode} eager={eager} />
          </EditablePostBody>
        </PostCard.Body>
        <PostCard.Footer post={post} signedIn={signedIn} viewerId={viewerId} showWatch={mode === 'list'} />
      </PostCard>
    </div>
  )
}

interface ColumnsProps extends Omit<ItemProps, 'submission' | 'eager' | 'mode'> {
  submissions: Submission[]
  columnCount: number
  headerText?: string
}

/** Submissions dealt into columns, under an optional "Submissions" / "Selections" title. */
export const SubmissionsAsGrid = ({ submissions, columnCount, headerText, ...rest }: ColumnsProps) => {
  const columns: { submission: Submission; index: number }[][] = Array.from({ length: columnCount }, () => [])
  submissions.forEach((submission, index) => columns[index % columnCount]?.push({ submission, index }))
  return (
    <div className="with-lightbox">
      <div className="Posts asGrid">
        {headerText && (
          <div className={styles.streamTitleWrapper}>
            <h2 className={styles.streamTitle}>{headerText}</h2>
          </div>
        )}
        {columns.map((column, i) => (
          <div className="Column" key={i}>
            {column.map(({ submission, index }) => (
              <SubmissionPost key={submission.id} submission={submission} mode="grid" eager={index < columnCount} {...rest} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

/** One submission per row (list mode). */
export const SubmissionsAsList = ({ submissions, headerText, ...rest }: Omit<ColumnsProps, 'columnCount'>) => (
  <div className="with-lightbox">
    <div className="Posts asList">
      {headerText && <h2 className={cn(styles.streamTitle, styles.listTitle)}>{headerText}</h2>}
      {submissions.map((submission, index) => (
        <SubmissionPost key={submission.id} submission={submission} mode="list" eager={index < 2} {...rest} />
      ))}
    </div>
  </div>
)
