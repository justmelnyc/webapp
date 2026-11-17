import { z } from 'zod'

export const loginSchema = z.object({
  usernameOrEmail: z.string().trim().min(1, 'Enter your username or email'),
  password: z.string().min(8, 'Passwords are at least 8 characters'),
})

export type LoginInput = z.infer<typeof loginSchema>
