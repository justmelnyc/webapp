'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { CommentForm, type ReplyRequest } from '@/components/comments/comment-form'
import { CommentLauncher } from '@/components/comments/comment-launcher'
import { CommentList } from '@/components/comments/comment-list'
import { commentsQueryKey, useCommentPages } from '@/components/comments/use-comment-pages'
import { useSeeMoreScroll } from '@/components/comments/use-see-more-scroll'
import { usePostEditStore } from '@/stores/post-edit-store'
import { useMediaQuery } from '@/components/layout/use-media-query'
import type { Post } from '@/types/post'
import type { CommentPage } from '@/types/stream'
import { cn } from '@/utils/cn'
import styles from './comments.module.css'

interface CommentSectionProps {
  /** The post, for the tools the lightbox of comment pictures shows. */
  post: Post
  postId: string
  postAuthorId: string
  viewer: { id: string; username: string; avatar: string | null }
  /** First page, rendered on the server. */
  initialPage: CommentPage
  /** `aside` is the right column from 60em up; `inline` sits under the post below that. */
  placement: 'inline' | 'aside'
}

/**
 * The original's `CommentContent` (rendered for signed-in viewers only): the editor, or its
 * launcher button below 60em, and the comment list. Only the placement that matches the viewport
 * renders, like the original's JS switch.
 */
export const CommentSection = ({ post, postId, postAuthorId, viewer, initialPage, placement }: CommentSectionProps) => {
  const isWide = useMediaQuery('(min-width: 60em)')
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isEditing, setEditing] = useState(false)
  // The original's `hasEditor`: no comment editor while the post itself is being edited.
  const isPostEditing = usePostEditStore((s) => s.editing?.id === postId)
  const [reply, setReply] = useState<ReplyRequest | null>(null)
  const queryKey = commentsQueryKey(postId)
  const pages = useCommentPages(postId, initialPage)
  const { comments } = pages
  useSeeMoreScroll(postId)

  if (isWide !== (placement === 'aside')) return null

  const changed = (): void => {
    void queryClient.invalidateQueries({ queryKey })
    router.refresh()
  }
  const onReply = (username: string): void => {
    setEditing(true)
    setReply({ username, nonce: Date.now() })
  }

  const showEditor = placement === 'aside' || isEditing

  return (
    <div className={cn('CommentContent', placement === 'aside' ? styles.aside : styles.content)}>
      {isPostEditing ? null : showEditor ? (
        <CommentForm
          postId={postId}
          onCreated={changed}
          onCancel={() => setEditing(false)}
          reply={reply}
          showReplyAll={viewer.id === postAuthorId && comments.length > 0}
        />
      ) : (
        <CommentLauncher avatar={viewer.avatar} username={viewer.username} onLaunch={() => setEditing(true)} />
      )}
      <section
        className={cn('StreamContainer TabListStreamContainer', styles.stream, comments.length === 0 && cn('empty', styles.empty))}
      >
        <CommentList comments={comments} post={post} viewerId={viewer.id} onReply={onReply} onChanged={changed} />
        {pages.hasNextPage ? (
          <div className={styles.paginator}>
            <button type="button" onClick={pages.fetchNextPage} disabled={pages.isFetchingNextPage}>
              {pages.isFetchingNextPage ? 'Loading...' : 'Load More'}
            </button>
          </div>
        ) : null}
        {pages.isError ? (
          <p role="alert" className={styles.error}>
            Couldn’t load comments.
          </p>
        ) : null}
      </section>
    </div>
  )
}
