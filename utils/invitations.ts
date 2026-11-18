import type { Invitation, InviteeUser, Invitee } from '@/types/invitation'

/** The original's `getBatchEmailState` input: split a pasted list on commas and whitespace. */
export const splitEmails = (value: string): string[] => value.split(/[,\s]+/)

/** True once the field holds something besides commas and spaces (the original's SUCCESS state). */
export const hasEmails = (value: string): boolean => value.replace(/(,|\s)/g, '').length > 0

/** Join each invitation with the user who accepted it, the way the original's `selectUser` does. */
export const toInvitees = (invitations: Invitation[], users: InviteeUser[]): Invitee[] =>
  invitations.map((invitation) => {
    const acceptedBy = invitation.links?.acceptedBy.id
    const user = invitation.acceptedAt && acceptedBy ? (users.find((u) => u.id === acceptedBy) ?? null) : null
    return { id: invitation.id, email: invitation.email, user }
  })
