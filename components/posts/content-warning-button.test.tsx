import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ContentWarningButton } from '@/components/posts/content-warning-button'

describe('ContentWarningButton', () => {
  it('toggles between View and Hide', async () => {
    render(<ContentWarningButton contentWarning="NSFW" />)
    expect(screen.getByText('NSFW')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button'))
    expect(screen.getByText('Hide')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button'))
    expect(screen.getByText('View')).toBeInTheDocument()
  })
})
