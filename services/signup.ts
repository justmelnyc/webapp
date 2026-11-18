import 'server-only'
import { rest } from '@/lib/api/client'
import { ApiError } from '@/lib/errors'
import { signupErrorsSchema, signupResponseSchema, type SignupInput } from '@/lib/schemas/invitation'

export interface SignupResult {
  token: string
  expiresIn: number
}

/** The first validation message of a 422 body, e.g. "username is invalid or has already been taken". */
export const signupErrorMessage = (detail: string): string | null => {
  try {
    const parsed = signupErrorsSchema.safeParse(JSON.parse(detail))
    if (!parsed.success) return null
    const [attr, messages] = Object.entries(parsed.data.errors.attrs)[0] ?? []
    if (!attr || messages === undefined) return null
    const text = Array.isArray(messages) ? messages[0] : messages
    return text ? `${attr.replace(/_/g, ' ')} ${text}` : null
  } catch {
    return null
  }
}

/** Create the account (the original's `signUpUser`) and return the new user's token. Throws ApiError. */
export const signUp = async ({ email, username, password, invitationCode }: SignupInput): Promise<SignupResult> => {
  try {
    const data = await rest('/api/v2/signup', signupResponseSchema, {
      method: 'POST',
      anonymous: true,
      body: { email, username, password, invitation_code: invitationCode },
    })
    return { token: data.access_token, expiresIn: data.expires_in }
  } catch (error) {
    if (error instanceof ApiError && error.status === 422) {
      throw new ApiError(422, signupErrorMessage(error.detail) ?? 'We could not create that account.')
    }
    throw error
  }
}
