import { z } from 'zod'
import { avatarSchema } from './image'

/** One row of `GET /api/v2/invitations`: pending until `acceptedAt` is set. */
export const invitationSchema = z.object({
  id: z.coerce.string(),
  email: z.string(),
  code: z.string().nullish(),
  createdAt: z.string().nullish(),
  acceptedAt: z.string().nullish(),
  links: z.object({ acceptedBy: z.object({ id: z.coerce.string() }) }).nullish(),
})

export const inviteeUserSchema = z.object({
  id: z.coerce.string(),
  username: z.string(),
  avatar: avatarSchema.nullish(),
  relationshipPriority: z.string().nullish(),
})

export const invitationsEnvelopeSchema = z.object({
  invitations: z.array(invitationSchema),
  linked: z.object({ users: z.array(inviteeUserSchema).default([]) }).default({ users: [] }),
})

export const invitationEmailEnvelopeSchema = z.object({ invitations: z.object({ email: z.string() }) })

export type Invitation = z.infer<typeof invitationSchema>
export type InviteeUser = z.infer<typeof inviteeUserSchema>

/** What the list renders: an accepted invitation carries the user who joined. */
export interface Invitee {
  id: string
  email: string
  user: InviteeUser | null
}
