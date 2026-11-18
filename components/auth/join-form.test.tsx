import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { checkSignupEmail, signup } from '@/actions/signup-actions'
import { JoinForm } from './join-form'

const replace = jest.fn()
const refresh = jest.fn()

jest.mock('next/navigation', () => ({ useRouter: () => ({ replace, refresh }) }))
jest.mock('@/actions/signup-actions', () => ({ checkSignupEmail: jest.fn(), signup: jest.fn() }))
jest.mock('@/actions/account-actions', () => ({ checkAvailability: jest.fn() }))

const checkEmail = jest.mocked(checkSignupEmail)
const signupMock = jest.mocked(signup)
const free = { ok: true as const, data: { email: true, suggestions: {} } }

describe('JoinForm', () => {
  beforeEach(() => jest.clearAllMocks())

  it('starts disabled without an invitation', () => {
    render(<JoinForm invitationCode={null} invitationEmail={null} />)
    expect(screen.getByRole('button', { name: 'Create account' })).toBeDisabled()
  })

  it('prefills and accepts the invited email, then moves on to username and password', async () => {
    checkEmail.mockResolvedValue(free)
    render(<JoinForm invitationCode="welcome1ad" invitationEmail="sam@example.com" />)
    expect(screen.getByLabelText('Email')).toHaveValue('sam@example.com')
    const button = screen.getByRole('button', { name: 'Create account' })
    expect(button).toBeEnabled()
    await userEvent.click(button)
    expect(checkEmail).toHaveBeenCalledWith('sam@example.com')
    expect(await screen.findByLabelText('Username')).toBeInTheDocument()
  })

  it('creates the account with the invitation code', async () => {
    checkEmail.mockResolvedValue(free)
    signupMock.mockResolvedValue({ ok: true, data: { redirectTo: '/' } })
    render(<JoinForm invitationCode="welcome1ad" invitationEmail="sam@example.com" />)
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }))
    await screen.findByLabelText('Username')
    // the username check is driven by the (mocked) availability action; short passwords keep the button off
    expect(screen.getByRole('button', { name: 'Discover Ello' })).toBeDisabled()
    await userEvent.type(screen.getByLabelText('Password'), 'short')
    expect(screen.getByRole('button', { name: 'Discover Ello' })).toBeDisabled()
    await waitFor(() => expect(signupMock).not.toHaveBeenCalled())
  })
})
