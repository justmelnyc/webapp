import { z } from 'zod'

export const sendInvitationsSchema = z.object({
  emails: z.array(z.string().trim().min(1)).min(1, 'Enter at least one email address'),
})

export const signupSchema = z.object({
  email: z.string().trim().min(1),
  username: z.string().trim().min(1).max(50),
  password: z.string().min(8).max(128),
  invitationCode: z.string().trim().min(1).optional(),
})

export const signupResponseSchema = z.object({ access_token: z.string(), expires_in: z.number() })

/** `{ errors: { attrs: { username: ['...'] } } }` or a plain string per attribute. */
export const signupErrorsSchema = z.object({
  errors: z.object({ attrs: z.record(z.string(), z.union([z.string(), z.array(z.string())])) }),
})

export type SignupInput = z.infer<typeof signupSchema>
