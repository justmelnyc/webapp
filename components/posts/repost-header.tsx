import Link from 'next/link'
import { RepostIcon } from '@/components/icons'
import { PostFollowButton } from '@/components/posts/post-follow-button'
import { timeAgoInWords } from '@/components/posts/time-ago-in-words'
import { Avatar } from '@/components/ui/avatar'
import type { Post } from '@/types/post'
import { cn } from '@/utils/cn'
import { avatarUrl } from '@/utils/images'
import { originalAuthorOf } from '@/utils/repost'
import './repost-header.css'

interface RepostHeaderProps {
  post: Post
  viewerId?: string | null
  /** A profile's posts page: the original hides the usual author header but keeps this one. */
  inUserDetail?: boolean
}

/** The original's `RepostHeader`: the original author, then "by @reposter" with the repost icon. */
export const RepostHeader = ({ post, viewerId, inUserDetail }: RepostHeaderProps) => {
  const original = originalAuthorOf(post)
  const reposter = post.author
  const detailPath = `/${reposter.username}/post/${post.token}`
  return (
    <header className={cn('PostHeader RepostHeader', inUserDetail && 'inUserDetail', viewerId === reposter.id && 'isOwnPost')}>
      <span className="author-with-relationship">
        <span className="container">
          <span className="PostHeaderAuthor RepostHeaderAuthor">
            <Link className="PostHeaderLink" href={`/${original.username}`}>
              <Avatar src={avatarUrl(original.avatar, 'regular')} name={original.username} />
              <span className="DraggableUsername">@{original.username}</span>
            </Link>
          </span>
          <PostFollowButton
            userId={original.id}
            priority={viewerId === original.id ? 'self' : original.currentUserState?.relationshipPriority}
            signedIn={!!viewerId}
          />
        </span>
        <span className="RepostHeaderReposter">
          <Link className="PostHeaderLink" href={`/${reposter.username}`}>
            <RepostIcon />
            <span className="DraggableUsername">{` by @${reposter.username}`}</span>
          </Link>
        </span>
      </span>
      <span className="PostHeaderTools">
        <Link className="PostHeaderTimeAgoLink" href={detailPath}>
          <span>{timeAgoInWords(post.createdAt)}</span>
        </Link>
      </span>
    </header>
  )
}
