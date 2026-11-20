import { render, screen } from '@testing-library/react'
import { PostsAsList } from '@/components/streams/post-columns'
import { gqlPost } from '@/test/fixtures/posts'
import { postSchema } from '@/types/post'
import { SubmissionHeader } from './submission-header'

jest.mock('@/actions/post-actions', () => ({ setLoved: jest.fn() }))
jest.mock('@/actions/relationship-actions', () => ({ setFollowing: jest.fn() }))
jest.mock('@/actions/moderation-actions', () => ({ flagPost: jest.fn(), flagUser: jest.fn(), setRelationship: jest.fn() }))
jest.mock('@/actions/repost-actions', () => ({ createRepost: jest.fn(), loadRepostCategories: jest.fn() }))
jest.mock('@/actions/post-edit-actions', () => ({ updatePost: jest.fn() }))
jest.mock('@/actions/composer-actions', () => ({ createPost: jest.fn(), deletePost: jest.fn() }))
// streams draw a post's comments under it (StreamComments): keep its server actions out of the test
jest.mock('@/actions/comment-actions', () => ({}))
jest.mock('@/actions/comment-post-actions', () => ({ createCommentFromBlocks: jest.fn() }))
jest.mock('@/components/auth/registration-dialog', () => ({ useRegistrationDialog: () => ({ open: jest.fn() }) }))
jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }), usePathname: () => '/' }))

const submission = { id: '5', status: 'unapproved', artistInvite: { id: '9', slug: 'neon-nights', title: 'Neon Nights' } }
const post = postSchema.parse({ ...gqlPost('p1'), artistInviteSubmission: submission })

describe('SubmissionHeader', () => {
  it('names the author and links the invites index', () => {
    render(<SubmissionHeader post={post} viewerId={null} />)
    expect(screen.getByRole('link', { name: /@ada/ })).toHaveAttribute('href', '/ada')
    expect(screen.getByRole('link', { name: 'Invite Submission' })).toHaveAttribute('href', '/invites')
  })
})

describe('feeds with category headers', () => {
  const posts = [post, postSchema.parse(gqlPost('p2'))]

  it('use the submission header for submitted posts only', () => {
    const { container } = render(<PostsAsList posts={posts} signedIn={false} showCategoryHeader />)
    expect(container.querySelectorAll('.ArtistInviteSubmissionHeader')).toHaveLength(1)
    expect(container.querySelectorAll('.UserPostHeader')).toHaveLength(1)
  })

  it('keep the plain header elsewhere', () => {
    const { container } = render(<PostsAsList posts={posts} signedIn={false} />)
    expect(container.querySelector('.ArtistInviteSubmissionHeader')).toBeNull()
  })
})
