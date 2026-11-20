'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { CommentForm, type ReplyRequest } from '@/components/comments/comment-form'
import { CommentList } from '@/components/comments/comment-list'
import { commentsQueryKey, useCommentPages } from '@/components/comments/use-comment-pages'
import { ElloMark } from '@/components/icons'
import { useLayoutModeStore } from '@/components/layout/layout-mode-store'
import { patchStreamPosts } from '@/components/streams/stream-cache'
import { usePostEditStore } from '@/stores/post-edit-store'
import { useRepostStore } from '@/stores/repost-store'
import { useStreamCommentsStore } from '@/stores/stream-comments-store'
import type { Post } from '@/types/post'
import { cn } from '@/utils/cn'
import styles from './stream-comments.module.css'

interface StreamCommentsProps {
  post: Post
  /** The signed-in viewer; signed out, the comment tool is a link and nothing opens here. */
  viewerId?: string | null
}

/**
 * A stream post's comments, opened by its comment tool (the original's `showCommentEditor`): they
 * step aside while the post is being reposted or edited (`showEditor`).
 */
export const StreamComments = ({ post, viewerId }: StreamCommentsProps) => {
  const isOpen = useStreamCommentsStore((s) => !!s.open[post.id])
  const reposting = useRepostStore((s) => s.postId === post.id)
  const editing = usePostEditStore((s) => s.editing?.id === post.id)
  if (!viewerId || !isOpen || reposting || editing) return null
  return <OpenStreamComments post={post} viewerId={viewerId} />
}

/** The comment editor (focused, as in the original outside post pages) and the first page of comments. */
const OpenStreamComments = ({ post, viewerId }: { post: Post; viewerId: string }) => {
  const queryClient = useQueryClient()
  const root = useRef<HTMLDivElement>(null)
  const [reply, setReply] = useState<ReplyRequest | null>(null)
  const isGridMode = useLayoutModeStore((s) => s.mode === 'grid')
  const followSeeMore = useStreamCommentsStore((s) => s.followSeeMore)
  const detailPath = `/${post.author.username}/post/${post.token}`
  const pages = useCommentPages(post.id)
  const { comments } = pages

  useEffect(() => {
    root.current?.querySelector('textarea')?.focus({ preventScroll: true })
  }, [])

  // the stream keeps its posts in the query cache: the bubble's count follows from there
  const changed = (by: number): void => {
    void queryClient.invalidateQueries({ queryKey: commentsQueryKey(post.id) })
    if (by === 0) return
    patchStreamPosts(queryClient, (candidate) =>
      candidate.id !== post.id
        ? candidate
        : { ...candidate, postStats: { ...candidate.postStats, commentsCount: Math.max(0, candidate.postStats.commentsCount + by) } },
    )
  }

  return (
    <div ref={root} className={styles.root}>
      <CommentForm
        postId={post.id}
        onCreated={() => changed(1)}
        reply={reply}
        showReplyAll={viewerId === post.author.id && post.postStats.commentsCount > 0}
      />
      {pages.isPending ? (
        <section className={cn('StreamContainer isBusy TabListStreamContainer isFullWidth', styles.stream, styles.busy)}>
          <div className={cn('StreamBusyIndicator', styles.indicator)}>
            <ElloMark className="isSpinner" />
          </div>
        </section>
      ) : comments.length === 0 ? (
        <section className="StreamContainer empty">
          {pages.isError ? (
            <p role="alert" className={styles.error}>
              Couldn’t load comments.
            </p>
          ) : null}
        </section>
      ) : (
        <section className={cn('StreamContainer TabListStreamContainer isFullWidth', styles.stream)}>
          <CommentList
            comments={comments}
            post={post}
            viewerId={viewerId}
            onReply={(username) => setReply({ username, nonce: Date.now() })}
            onChanged={() => changed(0)}
            onDeleted={() => changed(-1)}
            detailPath={isGridMode ? detailPath : undefined}
          />
          {pages.hasNextPage ? (
            // the original's "See More": the rest of the comments are on the post's page
            <div className={cn('Paginator isCentered', styles.paginator)}>
              <Link className="PaginatorLink" href={detailPath} onClick={() => followSeeMore(post.id)}>
                <span>See More</span>
              </Link>
            </div>
          ) : null}
        </section>
      )}
    </div>
  )
}
