import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { sendResetLink } from '@/actions/password-actions'
import { useToastStore } from '@/stores/toast-store'
import { ForgotPasswordForm } from './forgot-password-form'

jest.mock('@/actions/password-actions', () => ({ sendResetLink: jest.fn() }))

const sendMock = jest.mocked(sendResetLink)
const submit = () => screen.getByRole('button', { name: 'Reset password' })

describe('ForgotPasswordForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useToastStore.setState({ toasts: [] })
  })

  it('disables submit until the email is valid and explains an invalid one', async () => {
    render(<ForgotPasswordForm />)
    expect(submit()).toBeDisabled()
    await userEvent.type(screen.getByLabelText('Email'), 'ada')
    expect(await screen.findByText('That email is invalid. Please try again.')).toBeInTheDocument()
    expect(submit()).toBeDisabled()
    await userEvent.type(screen.getByLabelText('Email'), '@example.com')
    await waitFor(() => expect(submit()).toBeEnabled())
    expect(screen.queryByText('That email is invalid. Please try again.')).not.toBeInTheDocument()
  })

  it('sends the request and shows the notice whether or not the email exists', async () => {
    sendMock.mockResolvedValue({ ok: true, data: undefined })
    render(<ForgotPasswordForm />)
    await userEvent.type(screen.getByLabelText('Email'), 'ada@example.com')
    await waitFor(() => expect(submit()).toBeEnabled())
    await userEvent.click(submit())
    expect(sendMock).toHaveBeenCalledWith({ email: 'ada@example.com' })
    expect(await screen.findByText(/you will receive a password recovery link/)).toBeInTheDocument()
    expect(screen.queryByLabelText('Email')).not.toBeInTheDocument()
  })

  it('goes back to the form and toasts when the request fails', async () => {
    sendMock.mockResolvedValue({ ok: false, error: 'Could not reach the API' })
    render(<ForgotPasswordForm />)
    await userEvent.type(screen.getByLabelText('Email'), 'ada@example.com')
    await waitFor(() => expect(submit()).toBeEnabled())
    await userEvent.click(submit())
    expect(await screen.findByLabelText('Email')).toBeInTheDocument()
    expect(useToastStore.getState().toasts[0]?.message).toBe('Could not reach the API')
  })
})
