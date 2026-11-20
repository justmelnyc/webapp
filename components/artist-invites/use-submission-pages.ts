'use client'

import { useCallback } from 'react'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import type { SubmissionData } from '@/components/streams/stream-cache'
import { submissionPageSchema, type Submission, type SubmissionPage } from '@/types/artist-invite'

const fetchPage = async (href: string, page: number): Promise<SubmissionPage> => {
  const params = new URLSearchParams({ href, page: String(page) })
  const response = await fetch(`/api/artist-invites/submissions?${params}`)
  if (!response.ok) throw new Error('Could not load more submissions')
  return submissionPageSchema.parse(await response.json())
}

export const submissionsKey = (href: string): readonly ['submissions', string] => ['submissions', href]

interface SubmissionPages {
  submissions: Submission[]
  hasNextPage: boolean
  isFetchingNextPage: boolean
  isError: boolean
  loadMore: () => void
  /** Writes a changed submission (a curator's approve / select / decline) into the loaded pages. */
  update: (id: string, change: (submission: Submission) => Submission) => void
}

/**
 * One submission stream in the query cache, like the post streams (`PostStream`): the first page
 * comes from the server, later ones through the API route, and changes made by Server Actions are
 * written into the loaded pages (`patchStreamPosts` for the posts, `update` for the submissions).
 */
export const useSubmissionPages = (href: string, initialPage: SubmissionPage): SubmissionPages => {
  const queryClient = useQueryClient()
  const { data, hasNextPage, isFetchingNextPage, isError, fetchNextPage } = useInfiniteQuery({
    queryKey: submissionsKey(href),
    queryFn: ({ pageParam }) => fetchPage(href, pageParam),
    initialPageParam: 1,
    getNextPageParam: (last) => last.nextPage ?? undefined,
    initialData: { pages: [initialPage], pageParams: [1] },
    // dropped when the stream unmounts: coming back (a curator switching tabs after approving
    // something) starts from the server's fresh first page instead of the cached pages
    gcTime: 0,
  })
  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) void fetchNextPage()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])
  const update = useCallback(
    (id: string, change: (submission: Submission) => Submission) => {
      queryClient.setQueryData<SubmissionData>(submissionsKey(href), (old) =>
        old && {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            submissions: page.submissions.map((s) => (s.id === id ? change(s) : s)),
          })),
        },
      )
    },
    [queryClient, href],
  )
  const seen = new Set<string>()
  const submissions = data.pages
    .flatMap((page) => page.submissions)
    .filter((s) => (seen.has(s.id) ? false : (seen.add(s.id), true)))
  return { submissions, hasNextPage, isFetchingNextPage, isError, loadMore, update }
}
