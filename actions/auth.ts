'use server'

import { redirect } from 'next/navigation'
import { loginSchema } from '@/lib/schemas/auth'
import { errorMessage } from '@/lib/errors'
import { clearToken, setToken } from '@/lib/session'
import { requestToken } from '@/services/auth'
import { failure, success, type ActionResult } from '@/types/action'

export const login = async (input: unknown): Promise<ActionResult<{ redirectTo: string }>> => {
  const parsed = loginSchema.safeParse(input)
  if (!parsed.success) return failure(parsed.error.issues[0]?.message ?? 'Check your details')
  try {
    const { token, expiresIn } = await requestToken(parsed.data.usernameOrEmail, parsed.data.password)
    await setToken(token, expiresIn)
    return success({ redirectTo: '/' })
  } catch (error) {
    return failure(errorMessage(error))
  }
}

export const logout = async (): Promise<void> => {
  await clearToken()
  redirect('/')
}
