import { act, render as baseRender, screen, waitFor } from '@testing-library/react'
import type { ReactElement } from 'react'
import userEvent from '@testing-library/user-event'
import { setLoved } from '@/actions/post-actions'
import { RegistrationDialogProvider } from '@/components/auth/registration-dialog'
import { useToastStore } from '@/stores/toast-store'
import type { ActionResult } from '@/types/action'
import type { PageHeader } from '@/types/content'
import { LoveButton } from './love-button'

jest.mock('@/actions/post-actions', () => ({ setLoved: jest.fn() }))
jest.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({ replace: jest.fn(), refresh: jest.fn() }),
}))
jest.mock('@/actions/signup-actions', () => ({ checkSignupEmail: jest.fn(), signup: jest.fn() }))
jest.mock('@/actions/account-actions', () => ({ checkAvailability: jest.fn() }))

// The logged-out promo header (the original's `authPromo`) is what lets the sign-up dialog open.
const promo = {
  id: '1',
  kind: 'AUTHENTICATION',
  image: { hdpi: { url: 'http://x/y.jpg' } },
  user: { id: '1', username: 'ada', avatar: null },
} as unknown as PageHeader
const render = (ui: ReactElement) =>
  baseRender(<RegistrationDialogProvider header={promo}>{ui}</RegistrationDialogProvider>)

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

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Love' })).toHaveAttribute('aria-pressed', 'false'),
    )
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(useToastStore.getState().toasts).toMatchObject([{ kind: 'error', message: 'Nope' }])
  })

  it('opens the sign-up dialog for logged-out viewers instead of calling the action', async () => {
    render(<LoveButton postId="p1" loved={false} count={2} signedIn={false} />)
    await userEvent.click(screen.getByRole('button', { name: 'Love' }))
    expect(setLovedMock).not.toHaveBeenCalled()
    expect(screen.getByRole('dialog', { name: 'Sign up' })).toBeInTheDocument()
    expect(useToastStore.getState().toasts).toHaveLength(0)
    expect(screen.getByRole('button', { name: 'Love' })).toHaveAttribute('aria-pressed', 'false')
  })
})
