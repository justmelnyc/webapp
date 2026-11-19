import { z } from 'zod'

export const submissionStatuses = ['unapproved', 'approved', 'selected', 'declined'] as const
export const submissionStatusSchema = z.enum(submissionStatuses)
export type SubmissionStatus = z.infer<typeof submissionStatusSchema>

export const submissionActionTypes = ['approve', 'decline', 'select', 'unapprove', 'unselect'] as const
export const submissionActionSchema = z.object({
  href: z.string(),
  label: z.string(),
  method: z.string(),
  body: z.object({ status: z.string() }).nullish(),
})
export type SubmissionAction = z.infer<typeof submissionActionSchema>
/** Keyed by action type (approve, decline, select, unapprove, unselect); only the allowed ones are present. */
export const submissionActionsSchema = z.record(z.string(), submissionActionSchema.nullable())
export type SubmissionActions = z.infer<typeof submissionActionsSchema>
