'use client'

import { useCallback, useEffect, useState, useTransition } from 'react'
import { runSubmissionAction } from '@/actions/artist-invite-actions'
import { useLayoutModeStore } from '@/components/layout/layout-mode-store'
import { PostPaginator } from '@/components/streams/post-paginator'
import { useColumnCount } from '@/components/streams/use-column-count'
import { toast } from '@/stores/toast-store'
import { submissionPageSchema, type Submission, type SubmissionAction, type SubmissionPage } from '@/types/artist-invite'
import { SubmissionsAsGrid, SubmissionsAsList } from './submission-columns'
import '@/components/streams/stream.css'

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

const fetchPage = async (href: string, page: number): Promise<SubmissionPage> => {
  const params = new URLSearchParams({ href, page: String(page) })
  const response = await fetch(`/api/artist-invites/submissions?${params}`)
  if (!response.ok) throw new Error('Could not load more submissions')
  return submissionPageSchema.parse(await response.json())
}

/** The original's StreamContainer for submissions: columns of posts, 'Load More', and the curator's actions. */
export const SubmissionStream = ({ href, initialPage, headerText, signedIn, viewerId, infinite = false }: SubmissionStreamProps) => {
  const mode = useLayoutModeStore((state) => state.mode)
  const columnCount = useColumnCount()
  const [submissions, setSubmissions] = useState<Submission[]>(initialPage.submissions)
  const [nextPage, setNextPage] = useState<number | null>(initialPage.nextPage)
  const [busy, startLoading] = useTransition()

  const loadMore = useCallback(() => {
    if (nextPage === null || busy) return
    startLoading(async () => {
      try {
        const page = await fetchPage(href, nextPage)
        setSubmissions((current) => [...current, ...page.submissions.filter((s) => !current.some((c) => c.id === s.id))])
        setNextPage(page.nextPage)
      } catch {
        toast.error('Could not load more submissions')
      }
    })
  }, [href, nextPage, busy])

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
      setSubmissions((current) =>
        current.map((s) => (s.id === submission.id ? { ...s, status: result.data.status, actions: result.data.actions } : s)),
      )
    })
  }

  if (submissions.length === 0) return null
  const shared = { submissions, signedIn, viewerId, headerText, onAction }
  return (
    <section className="StreamContainer">
      {mode === 'grid' ? <SubmissionsAsGrid columnCount={columnCount} {...shared} /> : <SubmissionsAsList {...shared} />}
      {nextPage !== null && <PostPaginator isBusy={busy} onLoadMore={loadMore} />}
    </section>
  )
}
