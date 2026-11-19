import { render as baseRender, screen } from '@testing-library/react'
import type { ReactElement } from 'react'
import { RegistrationDialogProvider } from '@/components/auth/registration-dialog'
import { gqlAuthor, gqlPost, textRegion } from '@/test/fixtures/posts'
import { postSchema } from '@/types/post'
import { PostCard } from './post-card'

jest.mock('@/actions/post-actions', () => ({ setLoved: jest.fn() }))
jest.mock('@/actions/relationship-actions', () => ({ setFollowing: jest.fn() }))
jest.mock('@/actions/moderation-actions', () => ({
  flagPost: jest.fn(),
  flagUser: jest.fn(),
  setRelationship: jest.fn(),
}))
jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }), usePathname: () => '/' }))
jest.mock('@/actions/post-edit-actions', () => ({ loadEditablePost: jest.fn() }))

const post = postSchema.parse(
  gqlPost('p1', {
    createdAt: new Date(Date.now() - 5 * 60_000).toISOString(),
    postStats: { lovesCount: 7, commentsCount: 3, viewsCount: 120, repostsCount: 0 },
    currentUserState: { watching: false, loved: true, reposted: false },
  }),
)

// Follow buttons ask the sign-up dialog provider (mounted in the root layout) to open.
const render = (ui: ReactElement) =>
  baseRender(<RegistrationDialogProvider header={null}>{ui}</RegistrationDialogProvider>)

describe('PostCard', () => {
  it('Header links to the author profile and the post with a relative time', () => {
    render(<PostCard.Header post={post} />)
    const hrefs = screen.getAllByRole('link').map((link) => link.getAttribute('href'))
    expect(hrefs.filter((href) => href === '/ada')).toHaveLength(1)
    expect(screen.getByRole('link', { name: /@ada/ })).toHaveAttribute('href', '/ada')
    expect(screen.getByRole('link', { name: '5m' })).toHaveAttribute('href', '/ada/post/tokp1')
    expect(screen.getByRole('img', { name: 'ada' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Follow' })).toBeInTheDocument()
  })

  it('Header of a repost shows the original author and "by @reposter"', () => {
    const repost = postSchema.parse(
      gqlPost('p2', {
        author: gqlAuthor('theo', 'u2'),
        repostContent: [textRegion('<p>Original</p>')],
        repostedSource: { id: 'p9', token: 'tok9', author: gqlAuthor('mara', 'u3') },
      }),
    )
    const { container } = render(<PostCard.Header post={repost} />)
    expect(container.querySelector('header')).toHaveClass('RepostHeader')
    expect(screen.getByRole('link', { name: /@mara/ })).toHaveAttribute('href', '/mara')
    expect(screen.getByRole('link', { name: /by @theo/ })).toHaveAttribute('href', '/theo')
  })

  it('Footer shows view, comment and love counts and loved state', () => {
    render(<PostCard.Footer post={post} signedIn />)
    expect(screen.getByTitle('Views')).toHaveTextContent('120')
    const comments = screen.getByRole('link', { name: 'Comments' })
    expect(comments).toHaveTextContent('3')
    expect(comments).toHaveAttribute('href', '/ada/post/tokp1')
    expect(screen.getByRole('button', { name: 'Unlove' })).toBeInTheDocument()
    expect(screen.getByText('7')).toBeInTheDocument()
  })

  it('Footer hides the 0 of a post nobody has viewed (a fresh repost) but keeps the pill', () => {
    const fresh = postSchema.parse(gqlPost('p3', { postStats: { lovesCount: 0, commentsCount: 0, viewsCount: 0, repostsCount: 0 } }))
    render(<PostCard.Footer post={fresh} signedIn />)
    expect(screen.getByTitle('Views')).toHaveClass('isPill')
    expect(screen.getByTitle('Views').querySelector('.PostToolValue')).toBeEmptyDOMElement()
  })

  it('composes Root, Body and className', () => {
    const { container } = render(
      <PostCard className="mb-10">
        <PostCard.Body className="extra">content</PostCard.Body>
      </PostCard>,
    )
    expect(container.querySelector('article')).toHaveClass('mb-10', 'Post')
    expect(screen.getByText('content')).toHaveClass('extra')
  })

  describe('Footer Watch tool (list streams)', () => {
    const repostOfMara = postSchema.parse(
      gqlPost('p2', {
        author: gqlAuthor('theo', 'u2'),
        repostContent: [textRegion('<p>Original</p>')],
        repostedSource: { id: 'p9', token: 'tok9', author: gqlAuthor('mara', 'u3') },
      }),
    )
    const hasWatch = (container: HTMLElement): boolean => !!container.querySelector('.WatchTool')

    it("shows on other people's posts", () => {
      const { container } = render(<PostCard.Footer post={post} signedIn viewerId="u9" showWatch />)
      expect(hasWatch(container)).toBe(true)
    })

    it('is hidden on your own post', () => {
      const { container } = render(<PostCard.Footer post={post} signedIn viewerId={post.author.id} showWatch />)
      expect(hasWatch(container)).toBe(false)
    })

    it("is hidden on someone's repost of your own post (the original's isOwnOriginalPost)", () => {
      const { container } = render(<PostCard.Footer post={repostOfMara} signedIn viewerId="u3" showWatch />)
      expect(hasWatch(container)).toBe(false)
    })
  })
})
