import { render, screen } from '@testing-library/react'
import { postSchema, type Post } from '@/types/post'
import { gqlAuthor, gqlPost, textRegion } from '../../test/fixtures/posts'
import { DetailBody } from './detail-body'
import { DetailHeader } from './detail-header'

jest.mock('next/navigation', () => ({ useRouter: () => ({ refresh: jest.fn(), push: jest.fn() }) }))
jest.mock('@/components/auth/registration-dialog', () => ({ useRegistrationDialog: () => ({ open: jest.fn() }) }))
jest.mock('@/actions/relationship-actions', () => ({ setFollowing: jest.fn() }))
jest.mock('@/actions/composer-actions', () => ({ deletePost: jest.fn() }))
jest.mock('@/components/posts/use-edit-post', () => ({ useEditPost: () => ({ edit: jest.fn(), pending: false }) }))

/** `theo` reposts a post by `ada`; `own` is what theo added. */
const repost = (own: unknown[] = []): Post =>
  postSchema.parse({
    ...gqlPost('p2', { author: gqlAuthor('theo', 'u2') }),
    content: own,
    repostContent: [textRegion('<p>Original words</p>')],
    repostedSource: { id: 'p1', token: 'tok1', author: gqlAuthor('ada', 'u1') },
  })

describe('DetailHeader on a repost', () => {
  it('names the original author and "by @reposter"', () => {
    const { container } = render(<DetailHeader post={repost()} viewerId={null} placement="list" />)
    expect(container.querySelector('header')).toHaveClass('RepostHeader', 'RepostDetailHeader')
    expect(container.querySelector('.UserNameLink.RepostAuthor')).toHaveTextContent('@ada')
    expect(container.querySelector('.UserNameLink.RepostAuthor')).toHaveAttribute('href', '/ada')
    expect(screen.getByText('by @theo')).toBeInTheDocument()
    expect(container.querySelector('.FullNameLink')).toBeNull()
  })

  it('follows the original author inside the author link, not in the tools', () => {
    const { container } = render(<DetailHeader post={repost()} viewerId={null} placement="list" />)
    expect(container.querySelectorAll('.RelationshipContainer')).toHaveLength(1)
    expect(container.querySelector('.UserNameLink.RepostAuthor .RelationshipContainer')).not.toBeNull()
  })

  it('links the time to the repost itself', () => {
    const { container } = render(<DetailHeader post={repost()} viewerId={null} placement="list" />)
    expect(container.querySelector('.PostHeaderTimeAgoLink')).toHaveAttribute('href', '/theo/post/tokp2')
  })

  it('shows the badge of the original post\'s artist invite submission', () => {
    const submission = { id: 's1', status: 'approved', artistInvite: { id: 'i1', slug: 'neon-nights', title: 'Neon Nights' } }
    const post = postSchema.parse({
      ...repost(),
      repostedSource: { id: 'p1', token: 'tok1', author: gqlAuthor('ada', 'u1'), artistInviteSubmission: submission },
    })
    const { container } = render(<DetailHeader post={post} viewerId={null} placement="list" />)
    expect(container.querySelector('.ArtistInviteSubmissionStatusTool a')).toHaveAttribute('href', '/invites/neon-nights')
    expect(container.querySelector('.ArtistInviteSubmissionStatusTool')).toHaveTextContent('Accepted Submission to Neon Nights')
  })

  it('has no badge when neither the repost nor its original was submitted', () => {
    const { container } = render(<DetailHeader post={repost()} viewerId={null} placement="list" />)
    expect(container.querySelector('.ArtistInviteSubmissionStatusTool')).toBeNull()
  })

  it('keeps the author layout on an ordinary post', () => {
    const { container } = render(
      <DetailHeader post={postSchema.parse(gqlPost('p1'))} viewerId={null} placement="list" />,
    )
    expect(container.querySelector('header')).not.toHaveClass('RepostHeader')
    expect(container.querySelector('.FullNameLink')).not.toBeNull()
  })
})

describe('DetailBody on a repost', () => {
  const body = (post: Post) => (
    <DetailBody
      postId={post.id}
      regions={post.repostContent ?? []}
      assets={post.assets}
      repostAuthor={post.author}
      repostRegions={post.content}
    />
  )

  it('shows the original content, then the reposter words with their avatar', () => {
    const post = repost([textRegion('<p>Mine</p>')])
    const { container } = render(body(post))
    const reposted = container.querySelector('.RepostedBody')
    expect(screen.getByText('Original words')).toBeInTheDocument()
    expect(reposted).toHaveTextContent('Mine')
    expect(reposted?.querySelector('.Avatar')).not.toBeNull()
  })

  it('has no reposted body when the reposter added nothing', () => {
    const { container } = render(body(repost()))
    expect(screen.getByText('Original words')).toBeInTheDocument()
    expect(container.querySelector('.RepostedBody')).toBeNull()
  })
})
