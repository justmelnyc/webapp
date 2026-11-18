'use server'

import { sendSubmissionAction } from '@/services/artist-invites'
import { errorMessage } from '@/lib/errors'
import { failure, success, type ActionResult } from '@/types/action'
import { streamPath } from '@/utils/artist-invite'
import { submissionActionSchema, type SubmissionActions, type SubmissionStatus } from '@/types/artist-invite'

interface ActionUpdate {
  status: SubmissionStatus
  actions: SubmissionActions | null
}

/** Run one of a submission's curator actions (the API hands the client the href, label and body). */
export const runSubmissionAction = async (input: unknown): Promise<ActionResult<ActionUpdate>> => {
  const parsed = submissionActionSchema.safeParse(input)
  if (!parsed.success) return failure('Invalid action')
  const { href, method, body } = parsed.data
  if (!/^\/api\/v2\/artist_invite_submissions\/\w+\/\w+$/.test(streamPath(href))) return failure('Invalid action')
  try {
    const record = await sendSubmissionAction(href, method, body ?? {})
    return success({ status: record.status, actions: record.actions ?? null })
  } catch (error) {
    return failure(errorMessage(error))
  }
}
