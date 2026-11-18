import 'server-only'
import { rest } from '@/lib/api/client'
import { invitationEmailEnvelopeSchema, invitationsEnvelopeSchema, type Invitee } from '@/types/invitation'
import { toInvitees } from '@/utils/invitations'

/** The people the viewer invited, newest first (the original asks for 100 at a time). */
export const getInvitees = async (): Promise<Invitee[]> => {
  const data = await rest('/api/v2/invitations?per_page=100', invitationsEnvelopeSchema)
  return toInvitees(data.invitations, data.linked.users)
}

/** The email an invitation code was sent to, or null when the code is unknown or already used. */
export const getInvitationEmail = async (code: string): Promise<string | null> => {
  try {
    const data = await rest(`/api/v2/invitations/${encodeURIComponent(code)}`, invitationEmailEnvelopeSchema, {
      anonymous: true,
    })
    return data.invitations.email
  } catch {
    return null
  }
}
