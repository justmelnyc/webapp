import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { runSubmissionAction } from '@/actions/artist-invite-actions'
import { postSchema, type Post } from '@/types/post'
import { gqlPost } from '../../test/fixtures/posts'
import { DetailHeader } from './detail-header'

const refresh = jest.fn()
jest.mock('next/navigation', () => ({ useRouter: () => ({ refresh, push: jest.fn() }) }))
jest.mock('@/actions/artist-invite-actions', () => ({ runSubmissionAction: jest.fn() }))
jest.mock('@/components/auth/registration-dialog', () => ({ useRegistrationDialog: () => ({ open: jest.fn() }) }))
jest.mock('@/actions/relationship-actions', () => ({ setFollowing: jest.fn() }))
jest.mock('@/actions/composer-actions', () => ({ deletePost: jest.fn() }))
jest.mock('@/components/posts/use-edit-post', () => ({ useEditPost: () => ({ edit: jest.fn(), pending: false }) }))

const artistInvite = { id: '9', slug: 'neon-nights', title: 'Neon Nights' }
const approve = { href: '/api/v2/artist_invite_submissions/5/select', label: 'Select', method: 'PATCH', body: { status: 'selected' } }

const post = (submission: unknown): Post =>
  postSchema.parse({ ...gqlPost('p1'), artistInviteSubmission: submission })

describe('DetailHeader on a submission', () => {
  beforeEach(() => jest.clearAllMocks())

  it('shows the status badge to anyone', () => {
    render(<DetailHeader post={post({ id: '5', status: 'selected', artistInvite, actions: null })} viewerId={null} placement="list" />)
    expect(screen.getByText('Selected Submission to Neon Nights')).toBeInTheDocument()
    expect(document.querySelector('.post-admin-actions')).toBeNull()
  })

  it('has no submission UI on an ordinary post', () => {
    render(<DetailHeader post={post(null)} viewerId={null} placement="list" />)
    expect(document.querySelector('.ArtistInviteSubmissionStatusTool')).toBeNull()
  })

  it('puts the curator bar above the header in the sidebar and below it in the list', () => {
    const submission = { id: '5', status: 'approved', artistInvite, actions: { select: approve } }
    const { container, rerender } = render(<DetailHeader post={post(submission)} viewerId="u9" placement="sidebar" />)
    const holder = container.querySelector('.header-holder')
    expect(holder?.firstElementChild).toHaveClass('post-admin-actions')
    rerender(<DetailHeader post={post(submission)} viewerId="u9" placement="list" />)
    expect(container.querySelector('.header-holder')?.lastElementChild).toHaveClass('post-admin-actions')
  })

  it('runs a curator action and reloads the page', async () => {
    jest.mocked(runSubmissionAction).mockResolvedValue({ ok: true, data: { status: 'selected', actions: null } })
    const submission = { id: '5', status: 'approved', artistInvite, actions: { select: approve } }
    render(<DetailHeader post={post(submission)} viewerId="u9" placement="sidebar" />)
    await userEvent.click(document.querySelector('.post-admin-actions button.select') as HTMLElement)
    expect(runSubmissionAction).toHaveBeenCalledWith(approve)
    expect(refresh).toHaveBeenCalled()
  })
})
