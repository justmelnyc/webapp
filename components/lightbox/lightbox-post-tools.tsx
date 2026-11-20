'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { EyeIcon } from '@/components/icons'
import { useLayoutModeStore } from '@/components/layout/layout-mode-store'
import { useKeyboardShortcuts } from '@/components/layout/use-keyboard-shortcuts'
import { useMediaQuery } from '@/components/layout/use-media-query'
import { CommentButtonTool, CommentLinkTool, isMobileViewport } from '@/components/posts/comment-tool'
import { Hint } from '@/components/posts/hint'
import { LoveButton } from '@/components/posts/love-button'
import { numberToHuman } from '@/components/posts/number-to-human'
import { RepostTool, RepostVisitTool, ShareTool } from '@/components/posts/post-tool-actions'
import { SHORTCUT_KEYS } from '@/constants/shortcut-keys'
import { useRepostStore } from '@/stores/repost-store'
import { useStreamCommentsStore } from '@/stores/stream-comments-store'
import type { Post } from '@/types/post'
import { LightboxFeatureTool } from './lightbox-feature-tool'

const MOBILE = '(max-width: 39.9375em)'

/**
 * `onClickRepostPost` in the lightbox: once the repost editor opens, the lightbox closes; on a phone
 * the original always continues on the post page (the tool itself only does so from a grid).
 */
const useCloseOnRepost = (post: Post, path: string, onClose: () => void): void => {
  const router = useRouter()
  useEffect(
    () =>
      useRepostStore.subscribe((state, previous) => {
        if (state.postId !== post.id || previous.postId === post.id) return
        onClose()
        const fromGrid = useLayoutModeStore.getState().mode === 'grid'
        if (window.matchMedia(MOBILE).matches && !fromGrid) router.push(path)
      }),
    [post.id, path, onClose, router],
  )
}

/** Whose lightbox it is: a stream's (or a post page's), or the related posts' under a post (`isRelatedPost`). */
export type LightboxToolsVariant = 'stream' | 'related'

interface LightboxPostToolsProps {
  post: Post
  viewerId: string | null
  onClose: () => void
  variant?: LightboxToolsVariant
}

/**
 * The original's `CommentTool` in the lightbox (`PostLightBoxContainer.onClickToggleComments`).
 * Signed out it is a link to the post. Signed in it closes the lightbox and opens the post's
 * comments under it in the stream; for a related post, and on a phone, it goes to the post's page.
 */
const CommentTool = ({ post, path, signedIn, variant, onClose }: { post: Post; path: string; signedIn: boolean; variant: LightboxToolsVariant; onClose: () => void }) => {
  const router = useRouter()
  const show = useStreamCommentsStore((s) => s.show)
  const count = post.postStats.commentsCount
  if (!signedIn) return <CommentLinkTool path={path} count={count} className="isLightBox" />
  const onComment = (): void => {
    onClose()
    if (variant === 'related' || isMobileViewport()) return router.push(path)
    show(post.id)
  }
  return <CommentButtonTool count={count} className="isLightBox" onClick={onComment} />
}

/**
 * The original's `PostToolsLightBox`: comment, love, repost, share (not on phones), the curator's
 * feature star on a category page, and the view count at the right.
 */
export const LightboxPostTools = ({ post, viewerId, onClose, variant = 'stream' }: LightboxPostToolsProps) => {
  const isMobile = useMediaQuery(MOBILE)
  const signedIn = !!viewerId
  const path = `/${post.author.username}/post/${post.token}`
  const { lovesCount, repostsCount, viewsCount } = post.postStats
  const LightboxRepostTool = variant === 'related' ? RepostVisitTool : RepostTool
  const isOwn = !!viewerId && viewerId === post.author.id
  const router = useRouter()
  const toolsRef = useRef<HTMLElement>(null)
  useCloseOnRepost(post, path, onClose)
  // `PostLightBoxContainer.bindKeys`: `l` loves the post; signed out, the original's request is refused and it lands on the login page
  useKeyboardShortcuts({
    [SHORTCUT_KEYS.LOVE]: () => {
      if (!signedIn) return router.push('/enter')
      toolsRef.current?.querySelector<HTMLButtonElement>('.LoveTool > button')?.click()
    },
  })
  return (
    <header ref={toolsRef} className="PostTools with-lightbox">
      <CommentTool post={post} path={path} signedIn={signedIn} variant={variant} onClose={onClose} />
      <LoveButton
        className="isLightBox"
        postId={post.id}
        loved={post.currentUserState.loved}
        count={lovesCount}
        signedIn={signedIn}
      />
      {!(isOwn && repostsCount === 0) && (
        <LightboxRepostTool className="isLightBox" post={post} signedIn={signedIn} viewerId={viewerId} />
      )}
      {!isMobile && <ShareTool className="isLightBox" post={post} isPill={!signedIn} />}
      <LightboxFeatureTool post={post} />
      <span className="PostTool ViewsTool isLightBox">
        <Link href={path}>
          <EyeIcon />
          <span className="PostToolValue">{numberToHuman(viewsCount, false)}</span>
          <Hint>Views</Hint>
        </Link>
      </span>
    </header>
  )
}
