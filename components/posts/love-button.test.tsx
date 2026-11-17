import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { setLoved } from '@/actions/post-actions'
import { useToastStore } from '@/stores/toast-store'
import type { ActionResult } from '@/types/action'
import { LoveButton } from './love-button'

jest.mock('@/actions/post-actions', () => ({ setLoved: jest.fn() }))

const setLovedMock = jest.mocked(setLoved)

const deferred = () => {
  let resolve: (value: ActionResult) => void = () => undefined
  const promise = new Promise<ActionResult>((res) => {
    resolve = res
  })
  return { promise, resolve }
}

describe('LoveButton', () => {
  beforeEach(() => {
    setLovedMock.mockReset()
    useToastStore.setState({ toasts: [] })
  })

  it('shows the current state and count', () => {
    render(<LoveButton postId="p1" loved count={4} signedIn />)
    expect(screen.getByRole('button', { name: 'Unlove' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('4')).toBeInTheDocument()
  })

  it('hides a zero count', () => {
    render(<LoveButton postId="p1" loved={false} count={0} signedIn />)
    expect(screen.queryByText('0')).not.toBeInTheDocument()
  })

  it('toggles optimistically before the action resolves, then calls setLoved', async () => {
    const pending = deferred()
    setLovedMock.mockReturnValue(pending.promise)
    render(<LoveButton postId="p1" loved={false} count={2} signedIn />)

    await userEvent.click(screen.getByRole('button', { name: 'Love' }))

    expect(setLovedMock).toHaveBeenCalledWith('p1', true)
    expect(screen.getByRole('button', { name: 'Unlove' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeDisabled()

    await act(async () => pending.resolve({ ok: true, data: undefined }))
    expect(useToastStore.getState().toasts).toHaveLength(0)
  })

  it('unloving decrements the count and sends next=false', async () => {
    const pending = deferred()
    setLovedMock.mockReturnValue(pending.promise)
    render(<LoveButton postId="p9" loved count={5} signedIn />)
    await userEvent.click(screen.getByRole('button', { name: 'Unlove' }))
    expect(setLovedMock).toHaveBeenCalledWith('p9', false)
    expect(screen.getByText('4')).toBeInTheDocument()
    // React entangles async transitions, so an unresolved one would stall later tests
    await act(async () => pending.resolve({ ok: true, data: undefined }))
  })

  it('rolls back and shows an error toast when the action fails', async () => {
    const pending = deferred()
    setLovedMock.mockReturnValue(pending.promise)
    render(<LoveButton postId="p1" loved={false} count={2} signedIn />)

    await userEvent.click(screen.getByRole('button', { name: 'Love' }))
    expect(screen.getByText('3')).toBeInTheDocument()

    await act(async () => pending.resolve({ ok: false, error: 'Nope' }))

    await waitFor(() => expect(screen.getByRole('button', { name: 'Love' })).toHaveAttribute('aria-pressed', 'false'))
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(useToastStore.getState().toasts).toMatchObject([{ kind: 'error', message: 'Nope' }])
  })

  it('prompts logged-out viewers instead of calling the action', async () => {
    render(<LoveButton postId="p1" loved={false} count={2} signedIn={false} />)
    await userEvent.click(screen.getByRole('button', { name: 'Love' }))
    expect(setLovedMock).not.toHaveBeenCalled()
    expect(useToastStore.getState().toasts).toMatchObject([{ kind: 'info', message: 'Log in to love posts' }])
    expect(screen.getByRole('button', { name: 'Love' })).toHaveAttribute('aria-pressed', 'false')
  })
})
