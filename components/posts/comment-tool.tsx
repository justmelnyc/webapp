'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { ComponentProps, ReactNode } from 'react'
import { BubbleIcon } from '@/components/icons'
import { useLayoutModeStore } from '@/components/layout/layout-mode-store'
import { Hint } from '@/components/posts/hint'
import { numberToHuman } from '@/components/posts/number-to-human'
import { useStreamCommentsStore } from '@/stores/stream-comments-store'
import { cn } from '@/utils/cn'

/** Below 40em the original's `deviceSize` is `mobile`. */
export const isMobileViewport = (): boolean => window.innerWidth < 640

const Content = ({ count }: { count: number }) => (
  <>
    <BubbleIcon />
    <span className={cn('PostToolValue', count < 1 && 'isZero')}>{numberToHuman(count, false)}</span>
    <Hint>Comment</Hint>
  </>
)

const Tool = ({ count, className, children }: { count: number; className?: string; children: ReactNode }) => (
  <span className={cn('PostTool CommentTool', className)} data-count={count}>
    {children}
  </span>
)

interface CommentToolProps {
  /** The post's page. */
  path: string
  count: number
  /** Extra class on the tool (`isLightBox` inside the lightbox). */
  className?: string
}

/** Signed out, the original's `CommentTool` is a plain link to the post. */
export const CommentLinkTool = ({ path, count, className }: CommentToolProps) => (
  <Tool count={count} className={className}>
    <Link href={path} className={cn(count > 0 && 'isNotZero')} aria-label="Comments">
      <Content count={count} />
    </Link>
  </Tool>
)

interface CommentButtonToolProps extends Omit<CommentToolProps, 'path'> {
  onClick: () => void
  /** The comments it opens are showing (a stream post's own tool). */
  isActive?: boolean
}

/** Signed in, the tool is a button; what it does depends on where the post is drawn. */
export const CommentButtonTool = ({ count, className, onClick, isActive }: CommentButtonToolProps) => (
  <Tool count={count} className={className}>
    <button
      type="button"
      className={cn(count > 0 && 'isNotZero')}
      aria-label="Comments"
      aria-expanded={isActive}
      onClick={onClick}
    >
      <Content count={count} />
    </button>
  </Tool>
)

/**
 * Signed in, in a stream (`PostContainer.onClickToggleComments`): the bubble opens the post's
 * comments and the comment editor under the post, and closes them again. A grid card on a phone is
 * too narrow for that, so there it goes to the post page.
 */
export const CommentToggleTool = ({ postId, path, count }: CommentToolProps & { postId: string }) => {
  const router = useRouter()
  const toggle = useStreamCommentsStore((s) => s.toggle)
  const isOpen = useStreamCommentsStore((s) => !!s.open[postId])
  const onClick = (): void => {
    if (useLayoutModeStore.getState().mode === 'grid' && isMobileViewport()) return router.push(path)
    toggle(postId)
  }
  return <CommentButtonTool count={count} onClick={onClick} isActive={isOpen} />
}

/** Signed in, on a related post: the bubble goes to that post's page (`isRelatedPost`). */
export const CommentVisitTool = ({ path, count }: CommentToolProps) => {
  const router = useRouter()
  return <CommentButtonTool count={count} onClick={() => router.push(path)} />
}

/**
 * `footer.PostTools` of a stream post. `isCommentsActive` (the black bubble) is the original's
 * component state: set by the post's own comment tool, not when the lightbox opened the comments.
 */
export const PostToolsFooter = ({ postId, className, ...props }: ComponentProps<'footer'> & { postId: string }) => {
  const isActive = useStreamCommentsStore((s) => s.open[postId] === 'tool')
  return <footer className={cn('PostTools', isActive && 'isCommentsActive', className)} {...props} />
}
