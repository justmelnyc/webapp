import { render, screen } from '@testing-library/react'
import type { PostSubmission } from '@/types/post'
import { SubmissionStatusTool } from './submission-status-tool'

const submission = (status: PostSubmission['status']): PostSubmission => ({
  id: '1',
  status,
  artistInvite: { id: '9', slug: 'neon-nights', title: 'Neon Nights Poster Series' },
})

describe('SubmissionStatusTool', () => {
  it('badges an accepted submission and links to the invite', () => {
    render(<SubmissionStatusTool submission={submission('approved')} />)
    expect(screen.getByRole('link')).toHaveAttribute('href', '/invites/neon-nights')
    expect(screen.getByText('Accepted Submission to Neon Nights Poster Series')).toBeInTheDocument()
  })

  it('badges a selected submission', () => {
    render(<SubmissionStatusTool submission={submission('selected')} />)
    expect(screen.getByText('Selected Submission to Neon Nights Poster Series')).toBeInTheDocument()
    expect(document.querySelector('.ArtistInviteSubmissionSelectedIcon')).not.toBeNull()
  })

  it.each(['unapproved', 'declined'] as const)('shows nothing for a %s submission', (status) => {
    render(<SubmissionStatusTool submission={submission(status)} />)
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })
})
