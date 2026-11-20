import Link from 'next/link'
import type { ComponentProps } from 'react'
import { EyeIcon } from '@/components/icons'
import { CategoryFeatureTool } from '@/components/lightbox/lightbox-feature-tool'
import { LightboxTriggerTool } from '@/components/lightbox/lightbox-triggers'
import { CommentLinkTool, CommentToggleTool, CommentVisitTool, PostToolsFooter } from '@/components/posts/comment-tool'
import { Hint } from '@/components/posts/hint'
import { LoveButton } from '@/components/posts/love-button'
import { numberToHuman } from '@/components/posts/number-to-human'
import { PostFollowButton } from '@/components/posts/post-follow-button'
import { PostFlagTool } from '@/components/posts/post-flag-tool'
import { RepostHeader } from '@/components/posts/repost-header'
import { RepostTool, RepostVisitTool, ShareTool, WatchTool } from '@/components/posts/post-tool-actions'
import { Avatar } from '@/components/ui/avatar'
import type { Post } from '@/types/post'
import { cn } from '@/utils/cn'
import { avatarUrl } from '@/utils/images'
import { isRepost, originalAuthorOf } from '@/utils/repost'
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
  /** A profile's own posts page: only reposts keep a header there. */
  inUserDetail?: boolean
}

/**
 * Avatar, @username, follow icon and the age at the right (`PostHeader UserPostHeader`); reposts get
 * `RepostHeader`. As in the original a stream header has no Edit or Delete, also on the viewer's own
 * posts: those are on the post page (`DetailHeader`).
 */
const Header = ({ post, viewerId, inUserDetail }: HeaderProps) => {
  if (isRepost(post)) return <RepostHeader post={post} viewerId={viewerId} inUserDetail={inUserDetail} />
  const { author } = post
  return (
    <header className="PostHeader UserPostHeader">
      <div className="PostHeaderAuthor">
        <Link className="PostHeaderLink" href={`/${author.username}`}>
          <Avatar src={avatarUrl(author.avatar, 'regular')} name={author.username} />
          <span className="DraggableUsername max-w-full truncate">@{author.username}</span>
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
        <CategoryFeatureTool post={post} />
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

const ViewsTool = ({ post, signedIn }: Pick<FooterProps, 'post' | 'signedIn'>) => (
  <span className={cn('PostTool ViewsTool', signedIn && 'isPill')} title="Views">
    <Link href={detailPath(post)}>
      <EyeIcon />
      <span className="PostToolValue">{numberToHuman(post.postStats.viewsCount, false)}</span>
      <Hint>Views</Hint>
    </Link>
  </span>
)

const TimeAgoTool = ({ post }: Pick<FooterProps, 'post'>) => (
  <span className="PostTool TimeAgoTool">
    <Link href={detailPath(post)}>
      <span className="PostToolValue">{timeAgoInWords(post.createdAt)}</span>
      <Hint>Visit</Hint>
    </Link>
  </span>
)

/**
 * What the viewer is to the post: its author, or the author of the post it reposts (`isOwnOriginalPost`).
 * Signed out, the original compares two missing ids for a post that is not a repost and takes it for
 * the visitor's own original, which is why only reposts offer the Watch tool then.
 */
const ownership = (post: Post, viewerId?: string | null) => ({
  isOwn: !!viewerId && viewerId === post.author.id,
  isOwnOriginal: viewerId ? viewerId === originalAuthorOf(post).id : !isRepost(post),
})

/** The tools every footer ends with: lightbox, watch, share and flag. */
const TrailingTools = ({ post, signedIn, viewerId, showWatch }: FooterProps) => {
  const { isOwn, isOwnOriginal } = ownership(post, viewerId)
  return (
    <>
      <LightboxTriggerTool postId={post.id} summary={post.summary} />
      {showWatch && !isOwn && !isOwnOriginal && (
        <WatchTool postId={post.id} watching={post.currentUserState.watching} signedIn={signedIn} />
      )}
      <ShareTool post={post} isPill={!signedIn} />
      {signedIn && !isOwn ? <PostFlagTool postId={post.id} /> : null}
    </>
  )
}

/**
 * Views, comments, love, repost and share (`footer.PostTools`). Signed in, the comment tool opens the
 * comments under the post (`StreamComments`); signed out it links to the post.
 */
const Footer = ({ post, signedIn, viewerId, showWatch }: FooterProps) => {
  const path = detailPath(post)
  const { commentsCount, lovesCount, repostsCount } = post.postStats
  const { isOwn } = ownership(post, viewerId)
  return (
    <PostToolsFooter postId={post.id}>
      <ViewsTool post={post} signedIn={signedIn} />
      <TimeAgoTool post={post} />
      {signedIn ? (
        <CommentToggleTool postId={post.id} path={path} count={commentsCount} />
      ) : (
        <CommentLinkTool path={path} count={commentsCount} />
      )}
      <LoveButton postId={post.id} loved={post.currentUserState.loved} count={lovesCount} signedIn={signedIn} />
      {!(isOwn && repostsCount === 0) && <RepostTool post={post} signedIn={signedIn} viewerId={viewerId} />}
      <TrailingTools post={post} signedIn={signedIn} viewerId={viewerId} showWatch={showWatch} />
    </PostToolsFooter>
  )
}

/**
 * The footer of a related post under a post page (`isRelatedPost`): a grid card's tools without
 * the age, and the comment and repost tools go to that post's page instead of opening anything here.
 */
const RelatedFooter = ({ post, signedIn, viewerId }: Omit<FooterProps, 'showWatch'>) => {
  const path = detailPath(post)
  const { commentsCount, lovesCount, repostsCount } = post.postStats
  const { isOwn } = ownership(post, viewerId)
  const CommentTool = signedIn ? CommentVisitTool : CommentLinkTool
  return (
    <footer className="PostTools">
      <ViewsTool post={post} signedIn={signedIn} />
      <CommentTool path={path} count={commentsCount} />
      <LoveButton postId={post.id} loved={post.currentUserState.loved} count={lovesCount} signedIn={signedIn} />
      {!(isOwn && repostsCount === 0) && <RepostVisitTool post={post} signedIn={signedIn} viewerId={viewerId} />}
      <TrailingTools post={post} signedIn={signedIn} viewerId={viewerId} />
    </footer>
  )
}

/** <PostCard><PostCard.Header/><PostCard.Body/><PostCard.Footer/></PostCard>; a stream adds `<StreamComments/>` after the footer. */
export const PostCard = Object.assign(Root, { Header, Body, Footer, RelatedFooter })
