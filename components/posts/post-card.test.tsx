import { render, screen } from '@testing-library/react'
import { gqlPost } from '@/test/fixtures/posts'
import { postSchema } from '@/types/post'
import { PostCard } from './post-card'

jest.mock('@/actions/post-actions', () => ({ setLoved: jest.fn() }))
jest.mock('@/actions/relationship-actions', () => ({ setFollowing: jest.fn() }))

const post = postSchema.parse(
  gqlPost('p1', {
    createdAt: new Date(Date.now() - 5 * 60_000).toISOString(),
    postStats: { lovesCount: 7, commentsCount: 3, viewsCount: 120, repostsCount: 0 },
    currentUserState: { watching: false, loved: true, reposted: false },
  }),
)

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

  it('Footer shows view, comment and love counts and loved state', () => {
    render(<PostCard.Footer post={post} signedIn />)
    expect(screen.getByTitle('Views')).toHaveTextContent('120')
    const comments = screen.getByRole('link', { name: 'Comments' })
    expect(comments).toHaveTextContent('3')
    expect(comments).toHaveAttribute('href', '/ada/post/tokp1')
    expect(screen.getByRole('button', { name: 'Unlove' })).toBeInTheDocument()
    expect(screen.getByText('7')).toBeInTheDocument()
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
})
