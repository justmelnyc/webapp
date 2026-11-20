import { QueryClient } from '@tanstack/react-query'
import { gqlPost } from '@/test/fixtures/posts'
import { postSchema } from '@/types/post'
import { patchStreamPosts, type StreamData, type SubmissionData } from './stream-cache'

const page = (...ids: string[]) => ({ posts: ids.map((id) => postSchema.parse(gqlPost(id))), next: null, isLastPage: true })

describe('patchStreamPosts', () => {
  it('rewrites the matching post in every loaded stream and page', () => {
    const queryClient = new QueryClient()
    const data = (...pages: ReturnType<typeof page>[]): StreamData => ({ pages, pageParams: pages.map(() => null) })
    queryClient.setQueryData(['stream', { type: 'following' }], data(page('p1', 'p2'), page('p3')))
    queryClient.setQueryData(['stream', { type: 'user', username: 'ada' }], data(page('p3')))
    queryClient.setQueryData(['comments', 'p3'], { untouched: true })

    patchStreamPosts(queryClient, (post) =>
      post.id === 'p3' ? { ...post, currentUserState: { ...post.currentUserState, loved: true } } : post,
    )

    const loved = (key: unknown[]): boolean[] =>
      (queryClient.getQueryData<StreamData>(key)?.pages ?? []).flatMap((p) => p.posts.map((post) => post.currentUserState.loved))
    expect(loved(['stream', { type: 'following' }])).toEqual([false, false, true])
    expect(loved(['stream', { type: 'user', username: 'ada' }])).toEqual([true])
    expect(queryClient.getQueryData(['comments', 'p3'])).toEqual({ untouched: true })
  })

  it('rewrites the post inside loaded submission pages, leaving other submissions as they were', () => {
    const queryClient = new QueryClient()
    const submission = (id: string) => ({ id: `s${id}`, status: 'approved' as const, actions: null, post: postSchema.parse(gqlPost(id)) })
    const data: SubmissionData = {
      pages: [{ submissions: [submission('p1'), submission('p2')], nextPage: 2, totalCount: 3 }, { submissions: [submission('p3')], nextPage: null, totalCount: 3 }],
      pageParams: [1, 2],
    }
    queryClient.setQueryData(['submissions', '/href'], data)

    patchStreamPosts(queryClient, (post) =>
      post.id === 'p3' ? { ...post, postStats: { ...post.postStats, lovesCount: 9 } } : post,
    )

    const after = queryClient.getQueryData<SubmissionData>(['submissions', '/href'])
    expect(after?.pages.flatMap((p) => p.submissions.map((s) => s.post.postStats.lovesCount))).toEqual([2, 2, 9])
    expect(after?.pages[0]?.submissions[0]).toBe(data.pages[0]?.submissions[0])
    expect(after?.pages[1]?.nextPage).toBeNull()
  })
})
