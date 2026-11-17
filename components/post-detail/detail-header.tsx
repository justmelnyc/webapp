import Link from 'next/link'
import { Avatar } from '@/components/ui/avatar'
import type { Post } from '@/types/post'
import { cn } from '@/utils/cn'
import { avatarUrl } from '@/utils/images'
import { timeAgoInWords } from './time-ago-in-words'
import { OwnerTools } from './owner-tools'
import styles from './post-header.module.css'
import { RelationshipButton } from './relationship-button'

interface DetailHeaderProps {
  post: Post
  viewerId: string | null
}

/** The original's `PostDetailHeader`: avatar, names, time ago and the follow toggle. */
export const DetailHeader = ({ post, viewerId }: DetailHeaderProps) => {
  const { author } = post
  const profile = `/${author.username}`
  const isOwnPost = viewerId === author.id
  return (
    <div className="header-holder">
      <header className={cn('PostHeader PostDetailHeader', styles.header, isOwnPost && 'isOwnPost')}>
        <div className="PostHeaderLeft">
          <Link className="PostHeaderLinkAvatar" href={profile}>
            <Avatar src={avatarUrl(author.avatar, 'regular')} name={author.username} />
          </Link>
          <div className="PostHeaderLinks">
            <Link className="FullNameLink" href={profile}>
              <span className="DraggableUsername PostHeaderAuthorName">
                <span className="username-container">{author.name || `@${author.username}`}</span>
              </span>
            </Link>
            {author.name ? (
              <Link className="UserNameLink" href={profile}>
                <span className="DraggableUsername PostHeaderAuthorUsername">{`@${author.username}`}</span>
              </Link>
            ) : null}
          </div>
        </div>
        <div className={cn('PostHeaderTools', styles.headerTools)}>
          <Link className={cn('PostHeaderTimeAgoLink', styles.timeAgo)} href={`${profile}/post/${post.token}`}>
            <span>{timeAgoInWords(post.createdAt)}</span>
          </Link>
          {isOwnPost ? <OwnerTools postId={post.id} /> : null}
          <RelationshipButton
            userId={author.id}
            priority={isOwnPost ? 'self' : author.currentUserState?.relationshipPriority}
            signedIn={viewerId !== null}
          />
        </div>
      </header>
    </div>
  )
}
