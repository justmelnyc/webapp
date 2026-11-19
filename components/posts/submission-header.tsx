import Link from 'next/link'
import { PostFollowButton } from '@/components/posts/post-follow-button'
import { timeAgoInWords } from '@/components/posts/time-ago-in-words'
import { Avatar } from '@/components/ui/avatar'
import type { Post } from '@/types/post'
import { avatarUrl } from '@/utils/images'
import './submission-header.css'

interface SubmissionHeaderProps {
  post: Post
  viewerId?: string | null
}

/** The original's `ArtistInviteSubmissionHeader`: "@author", then an "Invite Submission" link, on the global and subscribed feeds. */
export const SubmissionHeader = ({ post, viewerId }: SubmissionHeaderProps) => {
  const { author } = post
  return (
    <header className="ArtistInviteSubmissionHeader">
      <div className="ArtistInviteSubmissionHeaderAuthor">
        <Link className="PostHeaderLink" href={`/${author.username}`}>
          <Avatar src={avatarUrl(author.avatar, 'regular')} name={author.username} />
          <span className="DraggableUsername">@{author.username}</span>
        </Link>
      </div>
      <PostFollowButton
        userId={author.id}
        priority={viewerId === author.id ? 'self' : author.currentUserState?.relationshipPriority}
        signedIn={!!viewerId}
      />
      <div className="ArtistInviteSubmissionHeaderInvite">
        <Link className="PostHeaderLink" href="/invites">
          <span className="ArtistInviteSubmissionHeaderInviteName">Invite Submission</span>
        </Link>
      </div>
      <div className="PostHeaderTools">
        <Link className="PostHeaderTimeAgoLink" href={`/${author.username}/post/${post.token}`}>
          <span>{timeAgoInWords(post.createdAt)}</span>
        </Link>
      </div>
    </header>
  )
}
