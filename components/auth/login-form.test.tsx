import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { login } from '@/actions/auth'
import { useToastStore } from '@/stores/toast-store'
import { LoginForm } from './login-form'

const replace = jest.fn()
const refresh = jest.fn()

jest.mock('next/navigation', () => ({ useRouter: () => ({ replace, refresh }) }))
jest.mock('@/actions/auth', () => ({ login: jest.fn() }))

const loginMock = jest.mocked(login)
const ok = { ok: true as const, data: { redirectTo: '/' } }

const fill = async (username = 'ada', password = 'password1') => {
  await userEvent.type(screen.getByLabelText('Username or Email'), username)
  await userEvent.type(screen.getByLabelText('Password'), password)
}
const submit = () => screen.getByRole('button', { name: /log/i })

describe('LoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useToastStore.setState({ toasts: [] })
  })

  it('disables submit until the form is valid', async () => {
    render(<LoginForm />)
    expect(submit()).toBeDisabled()
    await userEvent.type(screen.getByLabelText('Username or Email'), 'ada')
    expect(submit()).toBeDisabled()
    await userEvent.type(screen.getByLabelText('Password'), 'password1')
    await waitFor(() => expect(submit()).toBeEnabled())
  })

  it('shows the password length message and marks the field invalid', async () => {
    render(<LoginForm />)
    const password = screen.getByLabelText('Password')
    await userEvent.type(password, 'short')
    // Like the original, the message only appears once typing has paused for a second.
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(await screen.findByRole('alert', {}, { timeout: 2500 })).toHaveTextContent(
      'Password must be at least 8 characters.',
    )
    expect(password).toBeInvalid()
  })

  it('shows the username message for an invalid username', async () => {
    render(<LoginForm />)
    const username = screen.getByLabelText('Username or Email')
    await userEvent.type(username, 'a!')
    expect(await screen.findByText('That username or email is invalid.', {}, { timeout: 2500 })).toBeInTheDocument()
    expect(username).toBeInvalid()
  })

  it('shows no message when the username is cleared', async () => {
    render(<LoginForm />)
    const username = screen.getByLabelText('Username or Email')
    await userEvent.type(username, 'a')
    await userEvent.clear(username)
    await new Promise((resolve) => setTimeout(resolve, 1200))
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('logs in and navigates to the default route', async () => {
    loginMock.mockResolvedValue(ok)
    render(<LoginForm />)
    await fill('  ada  ')
    await waitFor(() => expect(submit()).toBeEnabled())
    await userEvent.click(submit())
    await waitFor(() => expect(replace).toHaveBeenCalledWith('/'))
    expect(loginMock).toHaveBeenCalledWith({ usernameOrEmail: 'ada', password: 'password1' })
    expect(refresh).toHaveBeenCalled()
  })

  it('follows a safe same-site next path', async () => {
    loginMock.mockResolvedValue(ok)
    render(<LoginForm next="/ada/post/abc?x=1" />)
    await fill()
    await waitFor(() => expect(submit()).toBeEnabled())
    await userEvent.click(submit())
    await waitFor(() => expect(replace).toHaveBeenCalledWith('/ada/post/abc?x=1'))
  })

  it.each(['//evil.com', 'https://evil.com', 'evil.com/x', ''])('does not follow unsafe next %p', async (next) => {
    loginMock.mockResolvedValue(ok)
    render(<LoginForm next={next} />)
    await fill()
    await waitFor(() => expect(submit()).toBeEnabled())
    await userEvent.click(submit())
    await waitFor(() => expect(replace).toHaveBeenCalledWith('/'))
  })

  it('shows an error toast and stays on the page when login fails', async () => {
    loginMock.mockResolvedValue({ ok: false, error: 'Bad credentials' })
    render(<LoginForm />)
    await fill()
    await waitFor(() => expect(submit()).toBeEnabled())
    await userEvent.click(submit())
    await waitFor(() =>
      expect(useToastStore.getState().toasts).toMatchObject([{ kind: 'error', message: 'Bad credentials' }]),
    )
    expect(await screen.findByText('Your username/email or password are incorrect')).toBeInTheDocument()
    expect(replace).not.toHaveBeenCalled()
    expect(submit()).toBeEnabled()
  })
})
