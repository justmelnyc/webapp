import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { setLoved } from '@/actions/post-actions'
import { RegistrationDialogProvider } from '@/components/auth/registration-dialog'
import { gqlPost, textRegion } from '@/test/fixtures/posts'
import { submissionPageSchema, type SubmissionPage } from '@/types/artist-invite'
import { SubmissionStream } from './submission-stream'

jest.mock('@/actions/post-actions', () => ({ setLoved: jest.fn(), setWatching: jest.fn() }))
jest.mock('@/actions/artist-invite-actions', () => ({ runSubmissionAction: jest.fn() }))
jest.mock('@/actions/relationship-actions', () => ({ setFollowing: jest.fn() }))
jest.mock('@/actions/moderation-actions', () => ({ flagPost: jest.fn(), flagUser: jest.fn(), setRelationship: jest.fn() }))
jest.mock('@/actions/repost-actions', () => ({ createRepost: jest.fn(), loadRepostCategories: jest.fn() }))
jest.mock('@/actions/post-edit-actions', () => ({ updatePost: jest.fn() }))
jest.mock('@/actions/composer-actions', () => ({ createPost: jest.fn() }))
// the post card's inline comments reach server-only code through these
jest.mock('@/actions/comment-actions', () => ({}))
jest.mock('@/actions/comment-post-actions', () => ({ createCommentFromBlocks: jest.fn() }))
jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }), usePathname: () => '/invites/x' }))

const setLovedMock = jest.mocked(setLoved)
const HREF = '/api/v2/artist_invites/x/approved_submissions'

const page = (ids: string[], nextPage: number | null): SubmissionPage =>
  submissionPageSchema.parse({
    submissions: ids.map((id) => ({
      id: `s${id}`,
      status: 'approved',
      actions: null,
      post: gqlPost(id, { summary: [textRegion(`<p>body ${id}</p>`)] }),
    })),
    nextPage,
    totalCount: ids.length,
  })

const renderStream = (initialPage: SubmissionPage) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: 60_000 } } })
  return render(
    <QueryClientProvider client={client}>
      <RegistrationDialogProvider header={null}>
        <SubmissionStream href={HREF} initialPage={initialPage} headerText="Submissions" signedIn viewerId="viewer" />
      </RegistrationDialogProvider>
    </QueryClientProvider>,
  )
}

describe('SubmissionStream', () => {
  const fetchMock = jest.fn()
  beforeEach(() => {
    setLovedMock.mockReset()
    fetchMock.mockReset()
    global.fetch = fetchMock as unknown as typeof fetch
    window.matchMedia = jest.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }))
  })

  it('renders the first page under its title, without a request', () => {
    renderStream(page(['a', 'b'], null))
    expect(screen.getByRole('heading', { name: 'Submissions' })).toBeInTheDocument()
    expect(screen.getAllByRole('article')).toHaveLength(2)
    expect(screen.queryByRole('button', { name: /load more/i })).not.toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('keeps a love after the request has finished', async () => {
    setLovedMock.mockResolvedValue({ ok: true, data: undefined })
    renderStream(page(['a', 'b'], null))
    const [first] = screen.getAllByRole('button', { name: 'Love' })
    if (!first) throw new Error('no love button')
    await userEvent.click(first)
    await waitFor(() => expect(setLovedMock).toHaveBeenCalledWith('a', true))
    // the transition is over: the count now comes from the stream's cached post, not the optimistic value
    await waitFor(() => expect(screen.getByRole('button', { name: 'Unlove' })).toBeEnabled())
    expect(screen.getByRole('button', { name: 'Unlove' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Unlove' }).closest('.LoveTool')).toHaveAttribute('data-count', '3')
    expect(screen.getAllByRole('button', { name: 'Love' })).toHaveLength(1)
  })

  it('loads the next page from the API route and dedupes submissions', async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => page(['b', 'c'], null) })
    renderStream(page(['a', 'b'], 2))
    await userEvent.click(screen.getByRole('button', { name: /load more/i }))
    await waitFor(() => expect(screen.getByText('body c')).toBeInTheDocument())
    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(`/api/artist-invites/submissions?${new URLSearchParams({ href: HREF, page: '2' })}`)
    expect(screen.getAllByRole('article')).toHaveLength(3)
    expect(screen.queryByRole('button', { name: /load more/i })).not.toBeInTheDocument()
  })
})
