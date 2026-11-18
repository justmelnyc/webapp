import { render } from '@testing-library/react'
import { InviteRedirect } from './invite-redirect'

const replace = jest.fn()
jest.mock('next/navigation', () => ({ useRouter: () => ({ replace }) }))

describe('InviteRedirect', () => {
  it('opens the partner site in a new tab and returns to /invites', () => {
    const openWindow = jest.spyOn(window, 'open').mockImplementation(() => null)
    render(<InviteRedirect url="https://example.com/open-call" />)
    expect(openWindow).toHaveBeenCalledWith('https://example.com/open-call', '_blank', 'noopener')
    expect(replace).toHaveBeenCalledWith('/invites')
    openWindow.mockRestore()
  })
})
