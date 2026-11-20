'use client'

import { useRouter } from 'next/navigation'
import { useContext, useOptimistic, useState, useTransition } from 'react'
import { QueryClientContext } from '@tanstack/react-query'
import { setWatching } from '@/actions/post-actions'
import { BoltIcon, RepostIcon, ShareIcon } from '@/components/icons'
import { Hint } from '@/components/posts/hint'
import { numberToHuman } from '@/components/posts/number-to-human'
import { useLayoutModeStore } from '@/components/layout/layout-mode-store'
import { ShareDialog } from '@/components/posts/share-dialog'
import { patchStreamPosts } from '@/components/streams/stream-cache'
import { useRepostStore } from '@/stores/repost-store'
import { useRegistrationDialog } from '@/components/auth/registration-dialog'
import { toast } from '@/stores/toast-store'
import type { Post } from '@/types/post'
import { cn } from '@/utils/cn'
import { originalAuthorOf } from '@/utils/repost'
import { postShareContent, type ShareContent } from '@/utils/share'

/** The original's `ShareTool`: opens the share dialog (link plus one button per channel). */
export const ShareTool = ({
  post,
  isPill,
  className,
}: {
  post: Pick<Post, 'token' | 'summary'> & { author: Pick<Post['author'], 'username'> }
  isPill: boolean
  /** Extra class on the tool (`isLightBox` inside the lightbox). */
  className?: string
}) => {
  const [content, setContent] = useState<ShareContent | null>(null)
  return (
    <span className={cn('PostTool ShareTool', isPill && 'isPill', className)}>
      <button
        type="button"
        onClick={() => setContent(postShareContent(window.location.origin, post))}
        aria-label="Share"
      >
        <ShareIcon />
        <Hint>Share</Hint>
      </button>
      {content && <ShareDialog content={content} onDismiss={() => setContent(null)} />}
    </span>
  )
}

interface RepostToolProps {
  post: Post
  signedIn: boolean
  viewerId?: string | null
  /** Extra class on the tool (`isLightBox` inside the lightbox). */
  className?: string
}

const postPath = (post: Post): string => `/${post.author.username}/post/${post.token}`

/** The viewer wrote the post (or the post it reposts) or has reposted it: the original's tool ignores clicks. */
const isRepostInert = (post: Post, viewerId?: string | null): boolean =>
  !!viewerId &&
  (viewerId === post.author.id || viewerId === originalAuthorOf(post).id || post.currentUserState.reposted)

const RepostToolView = ({ post, viewerId, className, onRepost }: Omit<RepostToolProps, 'signedIn'> & { onRepost: () => void }) => {
  const count = post.postStats.repostsCount
  return (
    <span className={cn('PostTool RepostTool', className)} data-count={count}>
      <button
        type="button"
        className={cn(count > 0 && 'hasPostToolDrawer')}
        style={isRepostInert(post, viewerId) ? { pointerEvents: 'none' } : undefined}
        onClick={onRepost}
        aria-label="Repost"
      >
        <RepostIcon />
        <Hint>Repost</Hint>
      </button>
      <button type="button" tabIndex={-1} aria-hidden className="PostToolDrawerButton">
        <span className={cn('PostToolValue', count < 1 && 'isZero')}>
          {numberToHuman(count, false)}
        </span>
      </button>
    </span>
  )
}

/** The original's `RepostTool`: opens the inline repost editor; your own posts and reposts are inert. */
export const RepostTool = ({ post, signedIn, viewerId, className }: RepostToolProps) => {
  const router = useRouter()
  const registration = useRegistrationDialog()
  const start = useRepostStore((s) => s.start)
  const mode = useLayoutModeStore((s) => s.mode)
  const onRepost = (): void => {
    if (!signedIn) return registration.open('post-tools')
    start(post.id)
    // a grid card on a phone is too narrow for the editor: the original continues on the post page
    if (mode === 'grid' && window.innerWidth < 640) router.push(postPath(post))
  }
  return <RepostToolView post={post} viewerId={viewerId} className={className} onRepost={onRepost} />
}

/** The repost tool of a related post (`isRelatedPost`): signed in, it goes to that post's page instead. */
export const RepostVisitTool = ({ post, signedIn, viewerId, className }: RepostToolProps) => {
  const router = useRouter()
  const registration = useRegistrationDialog()
  const onRepost = (): void => (signedIn ? router.push(postPath(post)) : registration.open('post-tools'))
  return <RepostToolView post={post} viewerId={viewerId} className={className} onRepost={onRepost} />
}

/** The original's `WatchTool` (list mode, other people's posts): the bolt toggles watching. */
export const WatchTool = ({
  postId,
  watching,
  signedIn,
}: {
  postId: string
  watching: boolean
  signedIn: boolean
}) => {
  const [state, setOptimistic] = useOptimistic<boolean, boolean>(watching, (_, next) => next)
  const [pending, startTransition] = useTransition()
  const registration = useRegistrationDialog()
  const queryClient = useContext(QueryClientContext)
  const toggle = (): void => {
    if (!signedIn) return registration.open('post-tools')
    startTransition(async () => {
      const next = !state
      setOptimistic(next)
      const result = await setWatching(postId, next)
      if (!result.ok) return toast.error(result.error)
      // streams hold their posts in the query cache: without this the bolt falls back once the request is done
      if (queryClient) patchStreamPosts(queryClient, (post) => (post.id === postId ? { ...post, currentUserState: { ...post.currentUserState, watching: next } } : post))
    })
  }
  return (
    <span className={cn('PostTool WatchTool', state && 'isWatchingPost')}>
      <button
        type="button"
        className={cn(state && 'isActive')}
        onClick={toggle}
        disabled={pending}
        aria-pressed={state}
        aria-label={state ? 'Mute' : 'Watch'}
      >
        <BoltIcon />
        <Hint>{state ? 'Mute' : 'Watch'}</Hint>
      </button>
    </span>
  )
}
