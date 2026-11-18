import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useComposerStore } from '@/stores/composer-store'
import { InviteSuccess } from './invite-success'

describe('InviteSuccess', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    useComposerStore.getState().reset()
    useComposerStore.getState().finishInviteSubmission()
  })
  afterEach(() => jest.useRealTimers())

  it('thanks the artist and dismisses itself after 6.66 seconds', () => {
    render(<InviteSuccess />)
    expect(screen.getByText('Submission received!')).toBeInTheDocument()
    act(() => jest.advanceTimersByTime(6659))
    expect(useComposerStore.getState().isOpen).toBe(true)
    act(() => jest.advanceTimersByTime(1))
    expect(useComposerStore.getState()).toMatchObject({ isOpen: false, inviteSuccess: false })
  })

  it('dismisses on the X', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    render(<InviteSuccess />)
    await user.click(screen.getByRole('button', { name: 'Close' }))
    expect(useComposerStore.getState().isOpen).toBe(false)
  })
})
