import type { InfiniteData, QueryClient } from '@tanstack/react-query'
import type { SubmissionPage } from '@/types/artist-invite'
import type { Post } from '@/types/post'
import type { PostPage } from '@/types/stream'

export type StreamData = InfiniteData<PostPage, string | null>

/** An artist invite's submission stream: pages of submissions, each carrying its post. */
export type SubmissionData = InfiniteData<SubmissionPage, number>

/**
 * Streams keep their posts in the query cache after the first page, so a change made through a
 * Server Action (a love, a watch, a curator's feature) has to be written into the loaded pages as
 * well: `change` runs for every loaded post (of post streams and of submission streams) and returns
 * it unchanged or with the new values.
 */
export const patchStreamPosts = (queryClient: QueryClient, change: (post: Post) => Post): void => {
  queryClient.setQueriesData<StreamData>({ queryKey: ['stream'] }, (data) =>
    data && { ...data, pages: data.pages.map((page) => ({ ...page, posts: page.posts.map(change) })) },
  )
  queryClient.setQueriesData<SubmissionData>({ queryKey: ['submissions'] }, (data) =>
    data && {
      ...data,
      pages: data.pages.map((page) => ({
        ...page,
        submissions: page.submissions.map((submission) => {
          const post = change(submission.post)
          return post === submission.post ? submission : { ...submission, post }
        }),
      })),
    },
  )
}
