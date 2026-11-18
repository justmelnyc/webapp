import { z } from 'zod'

export const loginSchema = z.object({
  usernameOrEmail: z.string().trim().min(1, 'Enter your username or email'),
  password: z.string().min(8, 'Passwords are at least 8 characters'),
})

export type LoginInput = z.infer<typeof loginSchema>

const EMAIL = /(.+)@(.+)\.([a-z]{2,})/i

export const forgotPasswordSchema = z.object({
  email: z.string().trim().regex(EMAIL, 'That email is invalid. Please try again.'),
})

export const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters.').max(128, 'Password must be at most 128 characters.'),
  token: z.string().min(1, 'This password link is not valid.'),
})

/** What PUT /api/v2/reset_password answers: who the new password belongs to. */
export const resetPasswordResponseSchema = z.object({ username: z.string() })

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
