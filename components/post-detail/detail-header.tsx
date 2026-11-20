import Link from 'next/link'
import { RepostIcon } from '@/components/icons'
import { Avatar } from '@/components/ui/avatar'
import type { Post } from '@/types/post'
import { cn } from '@/utils/cn'
import { avatarUrl } from '@/utils/images'
import { displaySubmissionOf, isRepost, originalAuthorOf } from '@/utils/repost'
import { timeAgoInWords } from './time-ago-in-words'
import { OwnerTools } from './owner-tools'
import styles from './post-header.module.css'
import { RelationshipButton } from './relationship-button'
import { SubmissionActions } from './submission-actions'
import { SubmissionStatusTool } from './submission-status-tool'

interface DetailHeaderProps {
  post: Post
  viewerId: string | null
  /** Where a curator's bar goes: above the header in the sidebar (from 60em), below it in the list. */
  placement: 'list' | 'sidebar'
}

/** The original's `PostDetailHeader`: avatar, names, time ago and the follow toggle. */
export const DetailHeader = ({ post, viewerId, placement }: DetailHeaderProps) => {
  // the curator's bar is for the post's own submission; the status badge also shows a reposted original's
  const { artistInviteSubmission: submission } = post
  const displaySubmission = displaySubmissionOf(post)
  const repost = isRepost(post)
  // On a repost the header names the original author and "by @reposter" (`post.author`).
  const author = repost ? originalAuthorOf(post) : post.author
  const profile = `/${author.username}`
  const isOwnPost = viewerId === post.author.id
  const relationship = (
    <RelationshipButton
      userId={author.id}
      priority={viewerId === author.id ? 'self' : author.currentUserState?.relationshipPriority}
      signedIn={viewerId !== null}
    />
  )
  return (
    <div className="header-holder">
      {placement === 'sidebar' && submission ? <SubmissionActions submission={submission} /> : null}
      <header
        className={cn(
          'PostHeader PostDetailHeader',
          repost && 'RepostHeader RepostDetailHeader',
          styles.header,
          isOwnPost && 'isOwnPost',
        )}
      >
        <div className="PostHeaderLeft">
          <Link className="PostHeaderLinkAvatar" href={profile}>
            <Avatar src={avatarUrl(author.avatar, 'regular')} name={author.username} />
          </Link>
          <div className="PostHeaderLinks">
            {repost ? (
              <>
                <Link className="UserNameLink RepostAuthor" href={profile}>
                  <span className="DraggableUsername PostHeaderAuthorUsername max-w-full truncate">
                    <span className="username-container">{`@${author.username}`}</span>
                  </span>
                  {relationship}
                </Link>
                <Link className="UserNameLink" href={`/${post.author.username}`}>
                  <RepostIcon />
                  <span className="DraggableUsername max-w-full truncate">{` by @${post.author.username}`}</span>
                </Link>
              </>
            ) : (
              <>
                <Link className="FullNameLink" href={profile}>
                  <span className="DraggableUsername PostHeaderAuthorName max-w-full truncate">
                    <span className="username-container">{author.name || `@${author.username}`}</span>
                  </span>
                </Link>
                {author.name ? (
                  <Link className="UserNameLink" href={profile}>
                    <span className="DraggableUsername PostHeaderAuthorUsername max-w-full truncate">{`@${author.username}`}</span>
                  </Link>
                ) : null}
              </>
            )}
          </div>
        </div>
        <div className={cn('PostHeaderTools', styles.headerTools)}>
          <Link
            className={cn('PostHeaderTimeAgoLink', styles.timeAgo)}
            href={`/${post.author.username}/post/${post.token}`}
          >
            <span>{timeAgoInWords(post.createdAt)}</span>
          </Link>
          {isOwnPost ? <OwnerTools postId={post.id} /> : null}
          {displaySubmission ? (
            <span>
              <SubmissionStatusTool submission={displaySubmission} />
            </span>
          ) : null}
          {repost ? null : relationship}
        </div>
      </header>
      {placement === 'list' && submission ? <SubmissionActions submission={submission} /> : null}
    </div>
  )
}
