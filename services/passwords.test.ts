import { rest, restVoid } from '@/lib/api/client'
import { NotFoundError } from '@/lib/errors'
import { ExpiredResetLinkError, requestPasswordReset, resetPassword } from './passwords'

jest.mock('@/lib/api/client', () => ({ rest: jest.fn(), restVoid: jest.fn() }))

const restMock = jest.mocked(rest)
const restVoidMock = jest.mocked(restVoid)

describe('password services', () => {
  beforeEach(() => jest.clearAllMocks())

  it('asks for a reset link anonymously', async () => {
    restVoidMock.mockResolvedValue(undefined)
    await requestPasswordReset('ada@example.com')
    expect(restVoidMock).toHaveBeenCalledWith('/api/v2/forgot-password', {
      method: 'POST',
      anonymous: true,
      body: { email: 'ada@example.com' },
    })
  })

  it('puts the new password with the token and returns the username', async () => {
    restMock.mockResolvedValue({ username: 'ada' })
    await expect(resetPassword({ password: 'longenough1', token: 'abc' })).resolves.toBe('ada')
    expect(restMock).toHaveBeenCalledWith('/api/v2/reset_password', expect.anything(), {
      method: 'PUT',
      anonymous: true,
      body: { password: 'longenough1', reset_password_token: 'abc' },
    })
  })

  it('turns the API 404 into an expired link error and rethrows the rest', async () => {
    restMock.mockRejectedValueOnce(new NotFoundError())
    await expect(resetPassword({ password: 'longenough1', token: 'old' })).rejects.toBeInstanceOf(ExpiredResetLinkError)
    const other = new Error('boom')
    restMock.mockRejectedValueOnce(other)
    await expect(resetPassword({ password: 'longenough1', token: 'abc' })).rejects.toBe(other)
  })
})
