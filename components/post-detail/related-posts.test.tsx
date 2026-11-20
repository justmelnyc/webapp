import { fireEvent, render as baseRender, screen, within } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactElement } from 'react'
import { RegistrationDialogProvider } from '@/components/auth/registration-dialog'
import { useStreamCommentsStore } from '@/stores/stream-comments-store'
import { gqlAuthor, gqlPost } from '@/test/fixtures/posts'
import { postSchema, type Post } from '@/types/post'
import { RelatedPosts } from './related-posts'

const push = jest.fn()
let mockColumns = 3
jest.mock('next/navigation', () => ({ useRouter: () => ({ push }), usePathname: () => '/ada/post/tok0' }))
jest.mock('@/components/streams/use-column-count', () => ({ useColumnCount: () => mockColumns }))
jest.mock('@/actions/post-actions', () => ({ setLoved: jest.fn(), setWatching: jest.fn() }))
jest.mock('@/actions/category-post-actions', () => ({ runCategoryPostAction: jest.fn() }))
jest.mock('@/actions/relationship-actions', () => ({ setFollowing: jest.fn() }))
jest.mock('@/actions/moderation-actions', () => ({ flagPost: jest.fn(), flagUser: jest.fn(), setRelationship: jest.fn() }))
jest.mock('@/actions/post-edit-actions', () => ({ loadEditablePost: jest.fn() }))

const posts: Post[] = ['a', 'b', 'c', 'd', 'e', 'f'].map((id) => postSchema.parse(gqlPost(id, { author: gqlAuthor('noor', 'u6') })))

const render = (ui: ReactElement) =>
  baseRender(
    <QueryClientProvider client={new QueryClient()}>
      <RegistrationDialogProvider header={null}>{ui}</RegistrationDialogProvider>
    </QueryClientProvider>,
  )
const columns = (container: HTMLElement): number[] =>
  [...container.querySelectorAll('.Column')].map((column) => column.querySelectorAll('.Post').length)

beforeEach(() => {
  push.mockReset()
  mockColumns = 3
  window.scrollTo = jest.fn()
  window.matchMedia = jest.fn().mockReturnValue({ matches: false, addEventListener: jest.fn(), removeEventListener: jest.fn() })
  useStreamCommentsStore.setState({ open: {} })
})

describe('RelatedPosts', () => {
  it('shows the title and one row: two posts in three columns at three viewport columns', () => {
    const { container } = render(<RelatedPosts posts={posts} viewerId="u1" />)
    expect(screen.getByRole('heading', { name: 'Related Posts' })).toBeInTheDocument()
    expect(container.querySelector('section')).toHaveClass('StreamContainer', 'RelatedPostsStreamContainer')
    expect(columns(container)).toEqual([1, 1, 0])
  })

  it('follows the viewport: two columns on a phone, three posts at four columns, six at seven', () => {
    mockColumns = 2
    expect(columns(render(<RelatedPosts posts={posts} viewerId="u1" />).container)).toEqual([1, 1])
    mockColumns = 4
    expect(columns(render(<RelatedPosts posts={posts} viewerId="u1" />).container)).toEqual([1, 1, 1])
    mockColumns = 7
    expect(columns(render(<RelatedPosts posts={posts} viewerId="u1" />).container)).toEqual([1, 1, 1, 1, 1, 1])
  })

  it('draws the empty stream, without a title, when nothing is related', () => {
    const { container } = render(<RelatedPosts posts={[]} viewerId="u1" />)
    expect(container.querySelector('section')).toHaveClass('StreamContainer', 'empty')
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('links each card to its own post and leaves out the age tool', () => {
    const { container } = render(<RelatedPosts posts={posts} viewerId={null} />)
    const first = container.querySelector('.PostGrid') as HTMLElement
    expect(within(first).getByRole('link', { name: 'Comments' })).toHaveAttribute('href', '/noor/post/toka')
    expect(first.querySelector('.ImageRegion a')).toHaveAttribute('href', '/noor/post/toka')
    expect(first.querySelector('.TimeAgoTool')).toBeNull()
  })

  it('sends a signed-in viewer to the related post from its comment tool, here and in its lightbox', () => {
    const { container } = render(<RelatedPosts posts={posts} viewerId="u1" />)
    const first = container.querySelector('.PostGrid') as HTMLElement
    fireEvent.click(within(first).getByRole('button', { name: 'Comments' }))
    expect(push).toHaveBeenLastCalledWith('/noor/post/toka')
    fireEvent.click(first.querySelector('.lightbox-trigger') as HTMLElement)
    const lightbox = screen.getByRole('dialog', { name: 'Lightbox' })
    expect(lightbox).toHaveClass('Posts', 'asList')
    expect(lightbox).not.toHaveClass('LightBoxInPost')
    // the original gives these pictures a post page's srcset (four candidates)
    expect(lightbox.querySelector('img.ImageAttachment')?.getAttribute('srcset')).toMatch(/ 180w, .* 750w, .* 1500w, .* 1920w$/)
    fireEvent.click(within(lightbox).getByRole('button', { name: 'Comments' }))
    expect(screen.queryByRole('dialog', { name: 'Lightbox' })).toBeNull()
    expect(push).toHaveBeenCalledTimes(2)
    expect(useStreamCommentsStore.getState().open).toEqual({})
  })
})
