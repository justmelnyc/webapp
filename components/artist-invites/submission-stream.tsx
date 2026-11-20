'use client'

import { useEffect, useRef } from 'react'
import { runSubmissionAction } from '@/actions/artist-invite-actions'
import { useLayoutModeStore } from '@/components/layout/layout-mode-store'
import { PostsLightbox } from '@/components/lightbox/post-lightbox'
import { PostPaginator } from '@/components/streams/post-paginator'
import { useColumnCount } from '@/components/streams/use-column-count'
import { toast } from '@/stores/toast-store'
import type { Submission, SubmissionAction, SubmissionPage } from '@/types/artist-invite'
import { SubmissionsAsGrid, SubmissionsAsList } from './submission-columns'
import { useSubmissionPages } from './use-submission-pages'
import '@/components/streams/stream.css'
import '@/components/streams/columns.css'

interface SubmissionStreamProps {
  /** The stream link the API gave for the invite (its href). */
  href: string
  initialPage: SubmissionPage
  headerText?: string
  signedIn: boolean
  viewerId?: string | null
  /** Curators' streams load more as you scroll; the public ones use the 'Load More' button only. */
  infinite?: boolean
}

/** The original's StreamContainer for submissions: columns of posts, 'Load More', and the curator's actions. */
export const SubmissionStream = ({ href, initialPage, headerText, signedIn, viewerId, infinite = false }: SubmissionStreamProps) => {
  const mode = useLayoutModeStore((state) => state.mode)
  const columnCount = useColumnCount()
  const { submissions, hasNextPage, isFetchingNextPage, isError, loadMore, update } = useSubmissionPages(href, initialPage)

  // a failed page is reported once, not on every render while the query stays in its error state
  const reported = useRef(false)
  useEffect(() => {
    if (isError && !reported.current) toast.error('Could not load more submissions')
    reported.current = isError
  }, [isError])

  useEffect(() => {
    if (!infinite) return undefined
    const onScroll = (): void => {
      const remaining = document.documentElement.scrollHeight - window.scrollY - window.innerHeight
      if (remaining < 600) loadMore()
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [infinite, loadMore])

  const onAction = (submission: Submission, action: SubmissionAction): void => {
    void runSubmissionAction(action).then((result) => {
      if (!result.ok) return toast.error(result.error)
      update(submission.id, (s) => ({ ...s, status: result.data.status, actions: result.data.actions }))
    })
  }

  if (submissions.length === 0) return null
  const shared = { submissions, signedIn, viewerId, headerText, onAction }
  return (
    <section className="StreamContainer">
      <PostsLightbox posts={submissions.map((submission) => submission.post)} viewerId={viewerId ?? null} isGridMode={mode === 'grid'}>
        {mode === 'grid' ? <SubmissionsAsGrid columnCount={columnCount} {...shared} /> : <SubmissionsAsList {...shared} />}
      </PostsLightbox>
      {hasNextPage && <PostPaginator isBusy={isFetchingNextPage} onLoadMore={loadMore} />}
    </section>
  )
}
