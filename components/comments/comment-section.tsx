'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { CommentForm, type ReplyRequest } from '@/components/comments/comment-form'
import { CommentItem } from '@/components/comments/comment-item'
import { CommentLauncher } from '@/components/comments/comment-launcher'
import { usePostEditStore } from '@/stores/post-edit-store'
import { fetchCommentPage } from '@/components/comments/fetch-comments'
import { useMediaQuery } from '@/components/layout/use-media-query'
import type { CommentPage } from '@/types/stream'
import { cn } from '@/utils/cn'
import styles from './comments.module.css'

interface CommentSectionProps {
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
export const CommentSection = ({ postId, postAuthorId, viewer, initialPage, placement }: CommentSectionProps) => {
  const isWide = useMediaQuery('(min-width: 60em)')
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isEditing, setEditing] = useState(false)
  // The original's `hasEditor`: no comment editor while the post itself is being edited.
  const isPostEditing = usePostEditStore((s) => s.editing?.id === postId)
  const [reply, setReply] = useState<ReplyRequest | null>(null)
  const queryKey = ['comments', postId]

  const query = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) => fetchCommentPage(postId, pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => (last.isLastPage ? undefined : last.next),
    initialData: { pages: [initialPage], pageParams: [null] },
  })

  if (isWide !== (placement === 'aside')) return null

  const changed = (): void => {
    void queryClient.invalidateQueries({ queryKey })
    router.refresh()
  }
  const onReply = (username: string): void => {
    setEditing(true)
    setReply({ username, nonce: Date.now() })
  }

  const seen = new Set<string>()
  const comments = query.data.pages
    .flatMap((page) => page.comments)
    .filter((comment) => (seen.has(comment.id) ? false : (seen.add(comment.id), true)))
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
        <div className="with-lightbox">
          <div className={cn('Comments', styles.comments)}>
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                postId={postId}
                isOwnComment={comment.author.id === viewer.id}
                canDelete={comment.author.id === viewer.id || postAuthorId === viewer.id}
                onReply={onReply}
                onDeleted={changed}
              />
            ))}
          </div>
        </div>
        {query.hasNextPage ? (
          <div className={styles.paginator}>
            <button type="button" onClick={() => void query.fetchNextPage()} disabled={query.isFetchingNextPage}>
              {query.isFetchingNextPage ? 'Loading...' : 'Load More'}
            </button>
          </div>
        ) : null}
        {query.isError ? (
          <p role="alert" className={styles.error}>
            Couldn’t load comments.
          </p>
        ) : null}
      </section>
    </div>
  )
}
