'use client'

import { useRouter } from 'next/navigation'
import { useOptimistic, useState, useTransition } from 'react'
import { setWatching } from '@/actions/post-actions'
import { BoltIcon, RepostIcon, ShareIcon } from '@/components/icons'
import { Hint } from '@/components/posts/hint'
import { numberToHuman } from '@/components/posts/number-to-human'
import { useLayoutModeStore } from '@/components/layout/layout-mode-store'
import { ShareDialog } from '@/components/posts/share-dialog'
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
}: {
  post: Pick<Post, 'token' | 'summary'> & { author: Pick<Post['author'], 'username'> }
  isPill: boolean
}) => {
  const [content, setContent] = useState<ShareContent | null>(null)
  return (
    <span className={cn('PostTool ShareTool', isPill && 'isPill')}>
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
}

/** The original's `RepostTool`: opens the inline repost editor; your own posts and reposts are inert. */
export const RepostTool = ({ post, signedIn, viewerId }: RepostToolProps) => {
  const router = useRouter()
  const registration = useRegistrationDialog()
  const start = useRepostStore((s) => s.start)
  const mode = useLayoutModeStore((s) => s.mode)
  const count = post.postStats.repostsCount
  const inert =
    !!viewerId &&
    (viewerId === post.author.id ||
      viewerId === originalAuthorOf(post).id ||
      post.currentUserState.reposted)
  const onRepost = (): void => {
    if (!signedIn) return registration.open('post-tools')
    start(post.id)
    // a grid card on a phone is too narrow for the editor: the original continues on the post page
    if (mode === 'grid' && window.innerWidth < 640)
      router.push(`/${post.author.username}/post/${post.token}`)
  }
  return (
    <span className="PostTool RepostTool" data-count={count}>
      <button
        type="button"
        className={cn(count > 0 && 'hasPostToolDrawer')}
        style={inert ? { pointerEvents: 'none' } : undefined}
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
  const toggle = (): void => {
    if (!signedIn) return registration.open('post-tools')
    startTransition(async () => {
      const next = !state
      setOptimistic(next)
      const result = await setWatching(postId, next)
      if (!result.ok) toast.error(result.error)
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
