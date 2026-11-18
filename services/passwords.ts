import 'server-only'
import { restVoid, rest } from '@/lib/api/client'
import { NotFoundError } from '@/lib/errors'
import { resetPasswordResponseSchema, type ResetPasswordInput } from '@/lib/schemas/auth'

/** Ask for a reset link. The API answers 200 whether or not the email exists, so neither do we. */
export const requestPasswordReset = async (email: string): Promise<void> => {
  await restVoid('/api/v2/forgot-password', { method: 'POST', anonymous: true, body: { email } })
}

/** Raised when the reset link is unknown, used or too old (the API's 404). */
export class ExpiredResetLinkError extends Error {
  constructor() {
    super('Your password link has expired.')
    this.name = 'ExpiredResetLinkError'
  }
}

/** Set a new password with a reset token; returns the username it belongs to. */
export const resetPassword = async ({ password, token }: ResetPasswordInput): Promise<string> => {
  try {
    const data = await rest('/api/v2/reset_password', resetPasswordResponseSchema, {
      method: 'PUT',
      anonymous: true,
      body: { password, reset_password_token: token },
    })
    return data.username
  } catch (error) {
    if (error instanceof NotFoundError) throw new ExpiredResetLinkError()
    throw error
  }
}
