import { z } from 'zod'
import { postSchema } from './post'
import { responsiveImageSchema } from './image'
import {
  submissionActionsSchema,
  submissionStatusSchema,
} from './submission-status'

export * from './submission-status'

export const artistInviteStatuses = ['preview', 'upcoming', 'open', 'selecting', 'closed'] as const
export const artistInviteStatusSchema = z.enum(artistInviteStatuses)
export type ArtistInviteStatus = z.infer<typeof artistInviteStatusSchema>

/** The four submission streams a curator can browse; visitors only see accepted (and, once closed, selected) work. */
export const submissionKeys = ['unapprovedSubmissions', 'approvedSubmissions', 'selectedSubmissions', 'declinedSubmissions'] as const
export const submissionKeySchema = z.enum(submissionKeys)
export type SubmissionKey = z.infer<typeof submissionKeySchema>

const streamLinkSchema = z.object({ type: z.string(), href: z.string(), label: z.string() })

export const artistInviteSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  inviteType: z.string(),
  status: artistInviteStatusSchema,
  openedAt: z.string(),
  closedAt: z.string(),
  shortDescription: z.string().nullish(),
  redirectUrl: z.string().nullish(),
  headerImage: responsiveImageSchema,
  logoImage: responsiveImageSchema,
  // detail only
  description: z.string().nullish(),
  guide: z.array(z.object({ title: z.string(), renderedBody: z.string() })).nullish(),
  submissionBodyBlock: z.string().nullish(),
  links: z.record(z.string(), streamLinkSchema).nullish(),
})
export type ArtistInvite = z.infer<typeof artistInviteSchema>

/** A submission as the REST API sends it, before its post is attached. */
export const submissionRecordSchema = z.object({
  id: z.string(),
  status: submissionStatusSchema,
  actions: submissionActionsSchema.nullish(),
  links: z.object({ post: z.object({ id: z.string() }) }),
})

export const submissionPageRecordSchema = z.object({
  artistInviteSubmissions: z.array(submissionRecordSchema),
  linked: z.object({ posts: z.array(z.object({ id: z.string(), token: z.string() })) }),
})

export const submissionSchema = z.object({
  id: z.string(),
  status: submissionStatusSchema,
  actions: submissionActionsSchema.nullish(),
  post: postSchema,
})
export type Submission = z.infer<typeof submissionSchema>

export const submissionPageSchema = z.object({
  submissions: z.array(submissionSchema),
  /** Page number to request next, or null on the last page. */
  nextPage: z.number().nullable(),
  totalCount: z.number(),
})
export type SubmissionPage = z.infer<typeof submissionPageSchema>
