import Link from 'next/link'
import type { ComponentProps } from 'react'
import { BubbleIcon, EyeIcon, LightBoxTriggerSmall } from '@/components/icons'
import { Hint } from '@/components/posts/hint'
import { LoveButton } from '@/components/posts/love-button'
import { numberToHuman } from '@/components/posts/number-to-human'
import { PostFollowButton } from '@/components/posts/post-follow-button'
import { PostOwnerMenu } from '@/components/posts/post-owner-menu'
import { RepostTool, ShareTool, WatchTool } from '@/components/posts/post-tool-actions'
import { Avatar } from '@/components/ui/avatar'
import type { Post } from '@/types/post'
import { cn } from '@/utils/cn'
import { avatarUrl } from '@/utils/images'
import { timeAgoInWords } from '@/components/posts/time-ago-in-words'
import './post-body.css'
import './post-header.css'
import './post-tools.css'
import './post-tools-more.css'
import './post-hints.css'

const detailPath = (post: Post): string => `/${post.author.username}/post/${post.token}`

const Root = ({ className, ...props }: ComponentProps<'article'>) => (
  <article className={cn('Post', className)} {...props} />
)

interface HeaderProps {
  post: Post
  viewerId?: string | null
}

/** Avatar, @username, follow icon and the age at the right (`PostHeader UserPostHeader`). */
const Header = ({ post, viewerId }: HeaderProps) => {
  const { author } = post
  return (
    <header className="PostHeader UserPostHeader">
      <div className="PostHeaderAuthor">
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
      <div className="PostHeaderTools">
        <Link className="PostHeaderTimeAgoLink" href={detailPath(post)}>
          <span>{timeAgoInWords(post.createdAt)}</span>
        </Link>
        <PostOwnerMenu post={post} viewerId={viewerId} />
      </div>
    </header>
  )
}

/** Wraps `<PostBody>` (the original's `div.with-lightbox`). */
const Body = ({ className, ...props }: ComponentProps<'div'>) => (
  <div className={cn('with-lightbox', className)} {...props} />
)

interface FooterProps {
  post: Post
  signedIn: boolean
  viewerId?: string | null
  /** List streams add the Watch tool on other people's posts (hidden below 40em by CSS). */
  showWatch?: boolean
}

/** Views, comments, love, repost and share (`footer.PostTools`). */
const Footer = ({ post, signedIn, viewerId, showWatch }: FooterProps) => {
  const path = detailPath(post)
  const { viewsCount, commentsCount, lovesCount, repostsCount } = post.postStats
  const isOwn = !!viewerId && viewerId === post.author.id
  return (
    <footer className="PostTools">
      <span className={cn('PostTool ViewsTool', signedIn && 'isPill')} title="Views">
        <Link href={path}>
          <EyeIcon />
          <span className="PostToolValue">{numberToHuman(viewsCount)}</span>
          <Hint>Views</Hint>
        </Link>
      </span>
      <span className="PostTool TimeAgoTool">
        <Link href={path}>
          <span className="PostToolValue">{timeAgoInWords(post.createdAt)}</span>
          <Hint>Visit</Hint>
        </Link>
      </span>
      <span className="PostTool CommentTool" data-count={commentsCount}>
        <Link href={path} className={cn(commentsCount > 0 && 'isNotZero')} aria-label="Comments">
          <BubbleIcon />
          <span className={cn('PostToolValue', commentsCount < 1 && 'isZero')}>{numberToHuman(commentsCount, false)}</span>
          <Hint>Comment</Hint>
        </Link>
      </span>
      <LoveButton postId={post.id} loved={post.currentUserState.loved} count={lovesCount} signedIn={signedIn} />
      {!(isOwn && repostsCount === 0) && <RepostTool count={repostsCount} />}
      <span className="PostTool LightBoxTriggerTool">
        <Link href={path} aria-label="Open post">
          <LightBoxTriggerSmall />
          <Hint>Lightbox</Hint>
        </Link>
      </span>
      {showWatch && !isOwn && (
        <WatchTool postId={post.id} watching={post.currentUserState.watching} signedIn={signedIn} />
      )}
      <ShareTool path={path} isPill={!signedIn} />
    </footer>
  )
}

/** <PostCard><PostCard.Header/><PostCard.Body/><PostCard.Footer/></PostCard> */
export const PostCard = Object.assign(Root, { Header, Body, Footer })
