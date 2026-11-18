'use server'

import { revalidatePath } from 'next/cache'
import { rest } from '@/lib/api/client'
import { errorMessage } from '@/lib/errors'
import { sendInvitationsSchema } from '@/lib/schemas/invitation'
import { invitationsEnvelopeSchema } from '@/types/invitation'
import { failure, success, type ActionResult } from '@/types/action'

/** The original's `inviteUsers`: sends (or re-sends, for a Re-Invite) invitations to these addresses. */
export const sendInvitations = async (input: unknown): Promise<ActionResult> => {
  const parsed = sendInvitationsSchema.safeParse(input)
  if (!parsed.success) return failure(parsed.error.issues[0]?.message ?? 'Check the email addresses')
  try {
    await rest('/api/v2/invitations', invitationsEnvelopeSchema, { method: 'POST', body: { email: parsed.data.emails } })
  } catch (error) {
    return failure(errorMessage(error))
  }
  revalidatePath('/invitations')
  return success(undefined)
}
