'use server'

import { z } from 'zod'
import { ONBOARDING_ROUTES } from '@/constants/onboarding'
import { rest } from '@/lib/api/client'
import { errorMessage } from '@/lib/errors'
import { availabilityResponseSchema, type Availability } from '@/lib/schemas/profile'
import { signupSchema } from '@/lib/schemas/invitation'
import { setToken } from '@/lib/session'
import { signUp } from '@/services/signup'
import { failure, success, type ActionResult } from '@/types/action'

/** The original's signup step one: is this email free? (`is_signup` marks the final check.) */
export const checkSignupEmail = async (email: unknown): Promise<ActionResult<Availability>> => {
  const parsed = z.string().trim().min(1).safeParse(email)
  if (!parsed.success) return failure('Nothing to check')
  try {
    const data = await rest('/api/v2/availability', availabilityResponseSchema, {
      method: 'POST',
      anonymous: true,
      body: { email: parsed.data, is_signup: true },
    })
    return success(data.availability)
  } catch (error) {
    return failure(errorMessage(error))
  }
}

/** The original's `signUpUser`: create the account, sign in as it and continue. */
export const signup = async (input: unknown): Promise<ActionResult<{ redirectTo: string }>> => {
  const parsed = signupSchema.safeParse(input)
  if (!parsed.success) return failure(parsed.error.issues[0]?.message ?? 'Check your details')
  try {
    const { token, expiresIn } = await signUp(parsed.data)
    await setToken(token, expiresIn)
    return success({ redirectTo: ONBOARDING_ROUTES.creatorType })
  } catch (error) {
    return failure(errorMessage(error))
  }
}
