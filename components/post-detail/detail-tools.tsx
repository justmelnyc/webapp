'use client'

import Link from 'next/link'
import { useOptimistic, useTransition } from 'react'
import { setLoved, setWatching } from '@/actions/post-actions'
import { BoltIcon, BubbleIcon, EyeIcon, FlagIcon, HeartIcon, RepostIcon, ShareIcon } from '@/components/icons'
import { toast } from '@/stores/toast-store'
import type { Post } from '@/types/post'
import { cn } from '@/utils/cn'
import { timeAgoInWords } from './time-ago-in-words'
import { Hint } from './hint'
import { numberToHuman } from './number-to-human'
import styles from './post-detail-tools.module.css'

interface DetailToolsProps {
  post: Post
  viewerId: string | null
}

const useLove = (post: Post, signedIn: boolean) => {
  const initial = { loved: post.currentUserState.loved, count: post.postStats.lovesCount }
  const [state, setOptimistic] = useOptimistic(initial, (current, next: boolean) => ({
    loved: next,
    count: current.count + (next ? 1 : -1),
  }))
  const [, startTransition] = useTransition()
  const toggle = (): void => {
    if (!signedIn) return toast.info('Log in to love posts')
    startTransition(async () => {
      const next = !state.loved
      setOptimistic(next)
      const result = await setLoved(post.id, next)
      if (!result.ok) toast.error(result.error)
    })
  }
  return { ...state, toggle }
}

const useWatch = (post: Post) => {
  const [watching, setOptimistic] = useOptimistic(post.currentUserState.watching, (_, next: boolean) => next)
  const [, startTransition] = useTransition()
  const toggle = (): void =>
    startTransition(async () => {
      const next = !watching
      setOptimistic(next)
      const result = await setWatching(post.id, next)
      if (!result.ok) toast.error(result.error)
    })
  return { watching, toggle }
}

const share = async (path: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(`${window.location.origin}${path}`)
    toast.success('Link copied')
  } catch {
    toast.error('Could not copy the link')
  }
}

/** The original's `PostTools` footer: every tool renders, the surrounding context hides some. */
export const DetailTools = ({ post, viewerId }: DetailToolsProps) => {
  const signedIn = viewerId !== null
  const isOwnPost = viewerId === post.author.id
  const detailPath = `/${post.author.username}/post/${post.token}`
  const love = useLove(post, signedIn)
  const watch = useWatch(post)
  const { commentsCount, repostsCount, viewsCount } = post.postStats
  const commentContent = (
    <>
      <BubbleIcon />
      <span className={cn('PostToolValue', commentsCount < 1 && 'isZero')}>{numberToHuman(commentsCount, false)}</span>
      <Hint>Comment</Hint>
    </>
  )

  return (
    <footer className={cn('PostTools', styles.tools)}>
      <span className="PostTool TimeAgoTool">
        <Link href={detailPath}>
          <span className="PostToolValue">{timeAgoInWords(post.createdAt)}</span>
          <Hint>Visit</Hint>
        </Link>
      </span>
      <span className="PostTool CommentTool" data-count={commentsCount}>
        {signedIn ? (
          <button type="button" className={cn(commentsCount > 0 && 'isNotZero')}>
            {commentContent}
          </button>
        ) : (
          <Link href={detailPath} className={cn(commentsCount > 0 && 'isNotZero')}>
            {commentContent}
          </Link>
        )}
      </span>
      <span className="PostTool LoveTool" data-count={love.count}>
        <button
          type="button"
          className={cn(love.loved && 'isActive', love.count > 0 && 'hasPostToolDrawer')}
          onClick={love.toggle}
          aria-pressed={love.loved}
        >
          <HeartIcon />
          <Hint>Love</Hint>
        </button>
        <button type="button" className={cn(love.loved && 'isActive', 'PostToolDrawerButton')} tabIndex={-1}>
          <span className={cn('PostToolValue', love.count < 1 && 'isZero')}>{numberToHuman(love.count, false)}</span>
        </button>
      </span>
      {isOwnPost && repostsCount === 0 ? null : (
        <span className="PostTool RepostTool" data-count={repostsCount}>
          <button
            type="button"
            className={cn(repostsCount > 0 && 'hasPostToolDrawer')}
            style={isOwnPost || post.currentUserState.reposted ? { pointerEvents: 'none' } : undefined}
            onClick={() => toast.info('Reposting is not available yet')}
          >
            <RepostIcon />
            <Hint>Repost</Hint>
          </button>
          <button type="button" className="PostToolDrawerButton" tabIndex={-1}>
            <span className={cn('PostToolValue', repostsCount < 1 && 'isZero')}>{numberToHuman(repostsCount, false)}</span>
          </button>
        </span>
      )}
      <span className={cn('PostTool ViewsTool isPostDetail', signedIn && 'isPill')}>
        <Link href={detailPath}>
          <EyeIcon />
          <span className="PostToolValue">{numberToHuman(viewsCount)}</span>
          <Hint>Views</Hint>
        </Link>
      </span>
      {signedIn && !isOwnPost ? (
        <span className={cn('PostTool WatchTool', watch.watching && 'isWatchingPost')}>
          <button type="button" className={cn(watch.watching && 'isActive')} onClick={watch.toggle} aria-pressed={watch.watching}>
            <BoltIcon />
            <Hint>{watch.watching ? 'Mute' : 'Watch'}</Hint>
          </button>
        </span>
      ) : null}
      <span className={cn('PostTool ShareTool', !signedIn && 'isPill')}>
        <button type="button" onClick={() => void share(detailPath)}>
          <ShareIcon />
          <Hint>Share</Hint>
        </button>
      </span>
      {signedIn && !isOwnPost ? (
        <span className="PostTool FlagTool ShyTool">
          <button type="button" onClick={() => toast.info('Reporting is not available yet')}>
            <FlagIcon />
            <Hint className="Flag">Report Post</Hint>
          </button>
        </span>
      ) : null}
    </footer>
  )
}
