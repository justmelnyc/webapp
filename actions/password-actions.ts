'use server'

import { errorMessage } from '@/lib/errors'
import { forgotPasswordSchema, resetPasswordSchema } from '@/lib/schemas/auth'
import { setToken } from '@/lib/session'
import { requestToken } from '@/services/auth'
import { ExpiredResetLinkError, requestPasswordReset, resetPassword } from '@/services/passwords'
import { failure, success, type ActionResult } from '@/types/action'

/** The original's `sendForgotPasswordRequest`. */
export const sendResetLink = async (input: unknown): Promise<ActionResult> => {
  const parsed = forgotPasswordSchema.safeParse(input)
  if (!parsed.success) return failure(parsed.error.issues[0]?.message ?? 'That email is invalid')
  try {
    await requestPasswordReset(parsed.data.email)
    return success(undefined)
  } catch (error) {
    return failure(errorMessage(error))
  }
}

export type ResetResult = ActionResult<{ redirectTo: string }> | { ok: false; error: string; expired: true }

/**
 * The original's `sendResetPasswordRequest`, then what its `resetPasswordSaga` meant to do: sign in with the new
 * password and go home. (The original looked the username up in a logged out store, so it never got that far.)
 */
export const changePassword = async (input: unknown): Promise<ResetResult> => {
  const parsed = resetPasswordSchema.safeParse(input)
  if (!parsed.success) return failure(parsed.error.issues[0]?.message ?? 'Check your password')
  try {
    const username = await resetPassword(parsed.data)
    const { token, expiresIn } = await requestToken(username, parsed.data.password)
    await setToken(token, expiresIn)
    return success({ redirectTo: '/' })
  } catch (error) {
    if (error instanceof ExpiredResetLinkError) return { ok: false, error: error.message, expired: true }
    return failure(errorMessage(error))
  }
}
