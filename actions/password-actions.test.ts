import { setToken } from '@/lib/session'
import { requestToken } from '@/services/auth'
import { ExpiredResetLinkError, requestPasswordReset, resetPassword } from '@/services/passwords'
import { changePassword, sendResetLink } from './password-actions'

jest.mock('@/lib/session', () => ({ setToken: jest.fn() }))
jest.mock('@/services/auth', () => ({ requestToken: jest.fn() }))
jest.mock('@/services/passwords', () => ({
  ...jest.requireActual('@/services/passwords'),
  requestPasswordReset: jest.fn(),
  resetPassword: jest.fn(),
}))

describe('sendResetLink', () => {
  beforeEach(() => jest.clearAllMocks())

  it('rejects an invalid email without calling the API', async () => {
    const result = await sendResetLink({ email: 'nope' })
    expect(result).toEqual({ ok: false, error: 'That email is invalid. Please try again.' })
    expect(requestPasswordReset).not.toHaveBeenCalled()
  })

  it('requests the link for a valid email', async () => {
    const result = await sendResetLink({ email: ' ada@example.com ' })
    expect(result.ok).toBe(true)
    expect(requestPasswordReset).toHaveBeenCalledWith('ada@example.com')
  })

  it('returns the failure when the request fails', async () => {
    jest.mocked(requestPasswordReset).mockRejectedValueOnce(new Error('down'))
    expect(await sendResetLink({ email: 'ada@example.com' })).toEqual({ ok: false, error: 'down' })
  })
})

describe('changePassword', () => {
  beforeEach(() => jest.clearAllMocks())

  it('resets, signs in as that user and goes home', async () => {
    jest.mocked(resetPassword).mockResolvedValue('ada')
    jest.mocked(requestToken).mockResolvedValue({ token: 'jwt', expiresIn: 60 })
    const result = await changePassword({ password: 'longenough1', token: 'abc' })
    expect(requestToken).toHaveBeenCalledWith('ada', 'longenough1')
    expect(setToken).toHaveBeenCalledWith('jwt', 60)
    expect(result).toEqual({ ok: true, data: { redirectTo: '/' } })
  })

  it('flags an expired link so the form can offer another', async () => {
    jest.mocked(resetPassword).mockRejectedValue(new ExpiredResetLinkError())
    expect(await changePassword({ password: 'longenough1', token: 'old' })).toEqual({
      ok: false,
      error: 'Your password link has expired.',
      expired: true,
    })
    expect(setToken).not.toHaveBeenCalled()
  })

  it('validates before calling the API', async () => {
    const result = await changePassword({ password: 'short', token: 'abc' })
    expect(result.ok).toBe(false)
    expect(resetPassword).not.toHaveBeenCalled()
  })
})
