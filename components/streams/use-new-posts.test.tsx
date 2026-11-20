import { QueryClient, QueryClientProvider, type InfiniteData } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { fetchStreamPage } from '@/lib/client/streams'
import { useNewPostsStore } from '@/stores/new-posts-store'
import { gqlPost } from '@/test/fixtures/posts'
import { postPageSchema, type PostPage, type StreamSpec } from '@/types/stream'
import { useNewPosts } from './use-new-posts'

jest.mock('@/lib/client/streams', () => ({ fetchStreamPage: jest.fn() }))

const fetchMock = jest.mocked(fetchStreamPage)
const spec: StreamSpec = { type: 'following', kind: 'RECENT' }
const queryKey = ['stream', spec]

const page = (ids: string[]): PostPage =>
  postPageSchema.parse({ posts: ids.map((id) => gqlPost(id)), next: null, isLastPage: true })

const setup = (shown: string[]) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  client.setQueryData<InfiniteData<PostPage, string | null>>(queryKey, { pages: [page(shown)], pageParams: [null] })
  const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>
  return { client, ...renderHook(() => useNewPosts(spec), { wrapper }) }
}

const shownIds = (client: QueryClient): string[] =>
  client.getQueryData<InfiniteData<PostPage>>(queryKey)?.pages.flatMap((p) => p.posts.map((post) => post.id)) ?? []

describe('useNewPosts', () => {
  beforeEach(() => {
    fetchMock.mockReset()
    window.scrollTo = jest.fn()
    useNewPostsStore.setState({ count: 0, apply: null })
  })

  it('offers posts it has not shown, and prepends them when applied', async () => {
    fetchMock.mockResolvedValue(page(['n2', 'n1', 'a', 'b']))
    const { client } = setup(['a', 'b'])
    await waitFor(() => expect(useNewPostsStore.getState().count).toBe(2))
    expect(shownIds(client)).toEqual(['a', 'b'])
    act(() => useNewPostsStore.getState().apply?.())
    expect(shownIds(client)).toEqual(['n2', 'n1', 'a', 'b'])
    expect(useNewPostsStore.getState().count).toBe(0)
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0 })
  })

  it('refreshes the posts it already shows without moving them', async () => {
    const base = page(['n1', 'b', 'a'])
    const fresh: PostPage = { ...base, posts: base.posts.map((post) => (post.id === 'b' ? { ...post, postStats: { ...post.postStats, lovesCount: 41 } } : post)) }
    fetchMock.mockResolvedValue(fresh)
    const { client } = setup(['a', 'b'])
    await waitFor(() => expect(useNewPostsStore.getState().count).toBe(1))
    expect(shownIds(client)).toEqual(['a', 'b'])
    const shown = client.getQueryData<InfiniteData<PostPage>>(queryKey)?.pages.flatMap((p) => p.posts) ?? []
    expect(shown.map((post) => post.postStats.lovesCount)).toEqual([2, 41])
  })

  it('stays quiet when nothing is new', async () => {
    fetchMock.mockResolvedValue(page(['a', 'b']))
    setup(['a', 'b'])
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(spec, null))
    expect(useNewPostsStore.getState().count).toBe(0)
  })

  it('replaces the stream when a whole page of posts is new', async () => {
    const fresh = Array.from({ length: 20 }, (_, i) => `n${i}`)
    fetchMock.mockResolvedValue(page(fresh))
    const { client } = setup(['a'])
    await waitFor(() => expect(shownIds(client)).toEqual(fresh))
    expect(useNewPostsStore.getState().count).toBe(0)
  })

  it('withdraws the offer when the stream unmounts', async () => {
    fetchMock.mockResolvedValue(page(['n1', 'a']))
    const { unmount } = setup(['a'])
    await waitFor(() => expect(useNewPostsStore.getState().count).toBe(1))
    unmount()
    expect(useNewPostsStore.getState().count).toBe(0)
  })

  it('ignores a failed check', async () => {
    fetchMock.mockRejectedValue(new Error('offline'))
    setup(['a'])
    await waitFor(() => expect(fetchMock).toHaveBeenCalled())
    expect(useNewPostsStore.getState().count).toBe(0)
  })
})
