import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen, waitFor } from '@testing-library/react'
import { fetchStreamPage } from '@/lib/client/streams'
import { gqlPost, textRegion } from '@/test/fixtures/posts'
import { postPageSchema, type PostPage, type StreamSpec } from '@/types/stream'
import { PostStream } from './post-stream'

jest.mock('@/actions/post-actions', () => ({ setLoved: jest.fn() }))
jest.mock('@/actions/relationship-actions', () => ({ setFollowing: jest.fn() }))
jest.mock('@/actions/moderation-actions', () => ({ flagPost: jest.fn(), flagUser: jest.fn(), setRelationship: jest.fn() }))
jest.mock('@/actions/repost-actions', () => ({ createRepost: jest.fn(), loadRepostCategories: jest.fn() }))
jest.mock('@/actions/post-edit-actions', () => ({ updatePost: jest.fn() }))
jest.mock('@/actions/composer-actions', () => ({ createPost: jest.fn() }))
jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }) }))
jest.mock('@/lib/client/streams', () => ({ fetchStreamPage: jest.fn() }))

const fetchMock = jest.mocked(fetchStreamPage)
const spec: StreamSpec = { type: 'global', kind: 'RECENT' }

const page = (ids: string[], next: string | null): PostPage =>
  postPageSchema.parse({
    posts: ids.map((id) => gqlPost(id, { summary: [textRegion(`<p>body ${id}</p>`)] })),
    next,
    isLastPage: next === null,
  })

let triggerIntersect: () => void = () => undefined

// Mirrors components/providers.tsx (staleTime keeps initialData from refetching on mount)
const renderStream = (initialPage: PostPage, emptyMessage?: string) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: 60_000 } } })
  return render(
    <QueryClientProvider client={client}>
      <PostStream spec={spec} initialPage={initialPage} signedIn emptyMessage={emptyMessage} />
    </QueryClientProvider>,
  )
}

describe('PostStream', () => {
  beforeEach(() => {
    fetchMock.mockReset()
    window.matchMedia = jest.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }))
    global.IntersectionObserver = jest.fn((callback: IntersectionObserverCallback) => {
      triggerIntersect = () =>
        callback([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver)
      return { observe: jest.fn(), disconnect: jest.fn() }
    }) as unknown as typeof IntersectionObserver
  })

  it('renders the initial page', () => {
    renderStream(page(['a', 'b'], null))
    expect(screen.getByText('body a')).toBeInTheDocument()
    expect(screen.getByText('body b')).toBeInTheDocument()
    expect(screen.getAllByRole('article')).toHaveLength(2)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('deals posts into columns in turn', () => {
    const { container } = renderStream(page(['a', 'b', 'c'], null))
    const columns = Array.from(container.querySelectorAll('.Column'), (column) => column.textContent)
    expect(columns).toHaveLength(2)
    expect(columns[0]).toContain('body a')
    expect(columns[0]).toContain('body c')
    expect(columns[1]).toContain('body b')
  })

  it('shows the default and custom empty messages', () => {
    const { unmount } = renderStream(page([], null))
    expect(screen.getByText('Nothing here yet.')).toBeInTheDocument()
    unmount()
    renderStream(page([], null), 'No loves yet')
    expect(screen.getByText('No loves yet')).toBeInTheDocument()
  })

  it('loads the next page with the cursor when the sentinel is visible, and dedupes posts', async () => {
    fetchMock.mockResolvedValue(page(['b', 'c'], null))
    renderStream(page(['a', 'b'], 'cur1'))

    act(() => triggerIntersect())
    expect(fetchMock).not.toHaveBeenCalled()
    act(() => {
      window.dispatchEvent(new Event('scroll'))
    })
    act(() => triggerIntersect())

    await waitFor(() => expect(screen.getByText('body c')).toBeInTheDocument())
    expect(fetchMock).toHaveBeenCalledWith(spec, 'cur1')
    expect(screen.getAllByRole('article')).toHaveLength(3)
    expect(screen.getAllByText('body b')).toHaveLength(1)
  })

  it('does not fetch when the last page was already loaded', () => {
    renderStream(page(['a'], null))
    act(() => {
      window.dispatchEvent(new Event('scroll'))
    })
    act(() => triggerIntersect())
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
