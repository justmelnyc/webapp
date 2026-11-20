import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fetchCommentPage } from '@/components/comments/fetch-comments'
import { useLayoutModeStore } from '@/components/layout/layout-mode-store'
import type { StreamData } from '@/components/streams/stream-cache'
import { useRepostStore } from '@/stores/repost-store'
import { useStreamCommentsStore } from '@/stores/stream-comments-store'
import { gqlAuthor, gqlComment, gqlPost } from '@/test/fixtures/posts'
import { postSchema } from '@/types/post'
import { commentPageSchema, postPageSchema, type CommentPage } from '@/types/stream'
import { StreamComments } from './stream-comments'

const createCommentFromBlocks = jest.fn()
jest.mock('next/navigation', () => ({
  usePathname: () => '/following',
  useRouter: () => ({ push: jest.fn(), refresh: jest.fn() }),
}))
jest.mock('@/components/comments/fetch-comments', () => ({ fetchCommentPage: jest.fn() }))
jest.mock('@/actions/comment-actions', () => ({ deleteComment: jest.fn(), updateComment: jest.fn(), fetchCommenterUsernames: jest.fn() }))
jest.mock('@/actions/comment-post-actions', () => ({
  createCommentFromBlocks: (postId: string, regions: unknown) => createCommentFromBlocks(postId, regions),
}))
jest.mock('@/actions/moderation-actions', () => ({ flagComment: jest.fn() }))
jest.mock('@/actions/post-actions', () => ({ setLoved: jest.fn(), setWatching: jest.fn() }))
jest.mock('@/actions/category-post-actions', () => ({ runCategoryPostAction: jest.fn() }))
jest.mock('@/actions/emoji-actions', () => ({ fetchEmojis: jest.fn().mockResolvedValue({ ok: true, data: { origin: '', emojis: [] } }) }))
jest.mock('@/stores/toast-store', () => ({ toast: { error: jest.fn(), info: jest.fn() } }))

const fetchMock = jest.mocked(fetchCommentPage)
const post = postSchema.parse(gqlPost('p1', { author: gqlAuthor('noor', 'u6') }))
const page = (ids: string[], isLastPage = true): CommentPage =>
  commentPageSchema.parse({ comments: ids.map((id) => gqlComment(id)), next: isLastPage ? null : '10', isLastPage })

const renderComments = (viewerId: string | null = 'u1') => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: 60_000 } } })
  client.setQueryData<StreamData>(['stream', { type: 'following' }], {
    pages: [postPageSchema.parse({ posts: [gqlPost('p1', { author: gqlAuthor('noor', 'u6') })], next: null, isLastPage: true })],
    pageParams: [null],
  })
  const view = render(
    <QueryClientProvider client={client}>
      <StreamComments post={post} viewerId={viewerId} />
    </QueryClientProvider>,
  )
  return { ...view, client }
}
const openComments = (): void => act(() => useStreamCommentsStore.getState().toggle('p1'))

beforeAll(() => {
  window.matchMedia = ((query: string) => ({ matches: false, media: query, addEventListener: jest.fn(), removeEventListener: jest.fn() })) as unknown as typeof window.matchMedia
})

beforeEach(() => {
  fetchMock.mockReset().mockResolvedValue(page(['c1', 'c2']))
  createCommentFromBlocks.mockReset().mockResolvedValue({ ok: true, data: { id: 'c9' } })
  useStreamCommentsStore.setState({ open: {} })
  useRepostStore.setState({ postId: null })
  useLayoutModeStore.setState({ mode: 'grid' })
})

describe('StreamComments', () => {
  it('draws nothing until the post\'s comments are opened, and loads nothing', () => {
    const { container } = renderComments()
    expect(container).toBeEmptyDOMElement()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('draws nothing for a signed-out viewer', () => {
    const { container } = renderComments(null)
    openComments()
    expect(container).toBeEmptyDOMElement()
  })

  it('opens the focused editor, the busy mark, then the first page of comments', async () => {
    const { container } = renderComments()
    openComments()
    expect(screen.getByRole('textbox', { name: 'Comment' })).toHaveFocus()
    expect(container.querySelector('.StreamContainer.isBusy.TabListStreamContainer .ElloMark.isSpinner')).not.toBeNull()
    await waitFor(() => expect(container.querySelectorAll('.Comment')).toHaveLength(2))
    expect(fetchMock).toHaveBeenCalledWith('p1', null)
    expect(container.querySelector('section')).toHaveClass('StreamContainer', 'TabListStreamContainer', 'isFullWidth')
    expect(container.querySelector('.Paginator')).toBeNull()
  })

  it('links "See More" to the post when there are more comments', async () => {
    fetchMock.mockResolvedValue(page(['c1', 'c2'], false))
    renderComments()
    openComments()
    const more = await screen.findByRole('link', { name: 'See More' })
    expect(more).toHaveAttribute('href', '/noor/post/tokp1')
    expect(more).toHaveClass('PaginatorLink')
    expect(more.parentElement).toHaveClass('Paginator', 'isCentered')
    expect(more.parentElement).not.toHaveClass('isBusy')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('shows the empty stream for a post without comments', async () => {
    fetchMock.mockResolvedValue(page([]))
    const { container } = renderComments()
    openComments()
    await waitFor(() => expect(container.querySelector('section.StreamContainer.empty')).not.toBeNull())
    expect(container.querySelector('.TabListStreamContainer')).toBeNull()
  })

  it('steps aside while the post is being reposted', async () => {
    const { container } = renderComments()
    openComments()
    await waitFor(() => expect(container.querySelectorAll('.Comment')).toHaveLength(2))
    act(() => useRepostStore.getState().start('p1'))
    expect(container).toBeEmptyDOMElement()
  })

  it('posts a comment, reloads the list and raises the count in the stream', async () => {
    const { container, client } = renderComments()
    openComments()
    await waitFor(() => expect(container.querySelectorAll('.Comment')).toHaveLength(2))
    fetchMock.mockResolvedValue(page(['c1', 'c2', 'c9']))
    await userEvent.type(screen.getByRole('textbox', { name: 'Comment' }), 'Lovely')
    await userEvent.click(screen.getByRole('button', { name: 'Comment' }))
    await waitFor(() => expect(container.querySelectorAll('.Comment')).toHaveLength(3))
    expect(createCommentFromBlocks).toHaveBeenCalledWith('p1', [{ kind: 'text', text: 'Lovely' }])
    const stream = client.getQueryData<StreamData>(['stream', { type: 'following' }])
    expect(stream?.pages[0]?.posts[0]?.postStats.commentsCount).toBe(2)
  })

  it('links comment text to the post in a grid, and leaves it plain in a list', async () => {
    const { container } = renderComments()
    openComments()
    await waitFor(() => expect(container.querySelectorAll('.Comment .RegionContent.isHot')).toHaveLength(2))
    act(() => useLayoutModeStore.setState({ mode: 'list' }))
    expect(container.querySelectorAll('.Comment .RegionContent')).toHaveLength(2)
    expect(container.querySelector('.Comment .RegionContent.isHot')).toBeNull()
  })

  it('fills in @username when Reply is pressed on a comment', async () => {
    renderComments()
    openComments()
    const [reply] = await screen.findAllByRole('button', { name: /Reply/ })
    await userEvent.click(reply as HTMLElement)
    expect(screen.getByRole('textbox', { name: 'Comment' })).toHaveValue('@grace ')
  })
})
