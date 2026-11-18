import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { changePassword } from '@/actions/password-actions'
import { useToastStore } from '@/stores/toast-store'
import { ResetPasswordForm } from './reset-password-form'

const replace = jest.fn()
const refresh = jest.fn()

jest.mock('next/navigation', () => ({ useRouter: () => ({ replace, refresh }) }))
jest.mock('@/actions/password-actions', () => ({ changePassword: jest.fn() }))

const changeMock = jest.mocked(changePassword)
const submit = () => screen.getByRole('button', { name: 'Change password' })

const fill = async (password = 'longenough1') => {
  await userEvent.type(screen.getByLabelText('Password'), password)
  await waitFor(() => expect(submit()).toBeEnabled())
}

describe('ResetPasswordForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useToastStore.setState({ toasts: [] })
  })

  it('shows the length message and keeps submit disabled for a short password', async () => {
    render(<ResetPasswordForm token="abc" />)
    await userEvent.type(screen.getByLabelText('Password'), 'short')
    expect(await screen.findByText('Password must be at least 8 characters.')).toBeInTheDocument()
    expect(submit()).toBeDisabled()
  })

  it('sends the password with the token from the link, then goes where the action says', async () => {
    changeMock.mockResolvedValue({ ok: true, data: { redirectTo: '/' } })
    render(<ResetPasswordForm token="abc" />)
    await fill()
    await userEvent.click(submit())
    expect(changeMock).toHaveBeenCalledWith({ password: 'longenough1', token: 'abc' })
    await waitFor(() => expect(replace).toHaveBeenCalledWith('/'))
    expect(refresh).toHaveBeenCalled()
  })

  it('says the link expired and links to request another', async () => {
    changeMock.mockResolvedValue({ ok: false, error: 'Your password link has expired.', expired: true })
    render(<ResetPasswordForm token="old" />)
    await fill()
    await userEvent.click(submit())
    expect(await screen.findByText(/Your password link has expired\./)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Click here to request another link.' })).toHaveAttribute('href', '/forgot-password')
    expect(replace).not.toHaveBeenCalled()
  })

  it('toasts other failures', async () => {
    changeMock.mockResolvedValue({ ok: false, error: 'Could not reach the API' })
    render(<ResetPasswordForm token="abc" />)
    await fill()
    await userEvent.click(submit())
    await waitFor(() => expect(useToastStore.getState().toasts[0]?.message).toBe('Could not reach the API'))
    expect(screen.queryByText(/has expired/)).not.toBeInTheDocument()
  })
})
