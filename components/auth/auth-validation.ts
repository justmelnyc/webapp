import { z } from 'zod'

/*
 * The original's client side checks (forms/Validators.js) as a zod schema for the sign in form, with
 * its messages. The server (`loginSchema`) stays the authority; this only drives the form's feedback.
 */
const USERNAME = /^[a-zA-Z0-9\-_]+$/
const EMAIL = /(.+)@(.+)\.([a-z]{2,})/
const PASSWORD = /^.{8,128}$/

export const isUsernameOrEmail = (value: string): boolean => USERNAME.test(value) || EMAIL.test(value)
export const isEmail = (value: string): boolean => EMAIL.test(value)

export const MESSAGES = {
  usernameOrEmail: 'That username or email is invalid.',
  password: 'Password must be at least 8 characters.',
  email: 'That email is invalid. Please try again.',
  credentials: 'Your username/email or password are incorrect',
} as const

export const signInFormSchema = z.object({
  usernameOrEmail: z
    .string()
    .trim()
    .min(1, MESSAGES.usernameOrEmail)
    .refine(isUsernameOrEmail, MESSAGES.usernameOrEmail),
  password: z.string().regex(PASSWORD, MESSAGES.password),
})

export const joinFormSchema = z.object({
  email: z.string().trim().min(1, MESSAGES.email).refine(isEmail, MESSAGES.email),
})

export type JoinInput = z.infer<typeof joinFormSchema>
