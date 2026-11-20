import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { setWatching } from '@/actions/post-actions'
import type { StreamData } from '@/components/streams/stream-cache'
import { gqlPost } from '@/test/fixtures/posts'
import { postSchema } from '@/types/post'
import { WatchTool } from './post-tool-actions'

jest.mock('@/actions/post-actions', () => ({ setWatching: jest.fn() }))
jest.mock('next/navigation', () => ({ usePathname: () => '/', useRouter: () => ({ push: jest.fn() }) }))
jest.mock('@/components/auth/registration-dialog', () => ({ useRegistrationDialog: () => ({ open: jest.fn() }) }))
jest.mock('@/components/posts/share-dialog', () => ({ ShareDialog: () => null }))

const setWatchingMock = jest.mocked(setWatching)
const KEY = ['stream', { type: 'following' }]

const seeded = (): QueryClient => {
  const queryClient = new QueryClient()
  const data: StreamData = {
    pages: [{ posts: [postSchema.parse(gqlPost('p1')), postSchema.parse(gqlPost('p2'))], next: null, isLastPage: true }],
    pageParams: [null],
  }
  queryClient.setQueryData(KEY, data)
  return queryClient
}

const watching = (queryClient: QueryClient): boolean[] =>
  (queryClient.getQueryData<StreamData>(KEY)?.pages ?? []).flatMap((page) => page.posts.map((post) => post.currentUserState.watching))

describe('WatchTool', () => {
  beforeEach(() => setWatchingMock.mockReset())

  it('writes the new state into the loaded stream so the bolt does not fall back', async () => {
    setWatchingMock.mockResolvedValue({ ok: true, data: undefined } as Awaited<ReturnType<typeof setWatching>>)
    const queryClient = seeded()
    render(
      <QueryClientProvider client={queryClient}>
        <WatchTool postId="p2" watching={false} signedIn />
      </QueryClientProvider>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Watch' }))
    expect(setWatchingMock).toHaveBeenCalledWith('p2', true)
    await waitFor(() => expect(watching(queryClient)).toEqual([false, true]))
  })

  it('leaves the stream alone when the request fails', async () => {
    setWatchingMock.mockResolvedValue({ ok: false, error: 'Nope' } as Awaited<ReturnType<typeof setWatching>>)
    const queryClient = seeded()
    render(
      <QueryClientProvider client={queryClient}>
        <WatchTool postId="p2" watching={false} signedIn />
      </QueryClientProvider>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Watch' }))
    await waitFor(() => expect(setWatchingMock).toHaveBeenCalled())
    expect(watching(queryClient)).toEqual([false, false])
  })
})
