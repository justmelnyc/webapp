import { z } from 'zod'
import { responsiveImageSchema } from './image'
import { submissionActionsSchema, submissionStatusSchema } from './submission-status'
import { authorSchema } from './user'

export const textRegionSchema = z.object({
  kind: z.literal('text'),
  data: z.string(),
  linkUrl: z.string().nullish(),
})

export const imageRegionSchema = z.object({
  kind: z.literal('image'),
  data: z.object({ url: z.string().nullish(), alt: z.string().nullish() }).passthrough(),
  linkUrl: z.string().nullish(),
  links: z.object({ assets: z.string().nullish() }).nullish(),
})

export const embedRegionSchema = z.object({
  kind: z.literal('embed'),
  data: z.record(z.string(), z.unknown()),
  linkUrl: z.string().nullish(),
})

export const regionSchema = z.discriminatedUnion('kind', [
  textRegionSchema,
  imageRegionSchema,
  embedRegionSchema,
])

export const assetSchema = z.object({ id: z.string(), attachment: responsiveImageSchema })

/** The original post a repost points at (`repostedSource`): who wrote it and where it lives. */
export const repostedSourceSchema = z.object({
  id: z.string(),
  token: z.string(),
  author: authorSchema,
  /** Only notifications ask for these (they summarize the original). */
  summary: z.array(regionSchema).nullish(),
  assets: z.array(assetSchema).nullish(),
})

/** Set on posts submitted to an artist invite; `actions` only when the viewer curates that invite. */
export const postSubmissionSchema = z.object({
  id: z.string(),
  status: submissionStatusSchema,
  artistInvite: z.object({ id: z.string(), slug: z.string(), title: z.string() }),
  actions: submissionActionsSchema.nullish(),
})

/** A post's place in a category (the original's `categoryPostSummary`); the first one names its category header. */
export const categoryPostSchema = z.object({
  id: z.string(),
  status: z.string().nullish(),
  featuredBy: z.object({ username: z.string() }).nullish(),
  submittedBy: z.object({ username: z.string() }).nullish(),
  category: z.object({ id: z.string(), slug: z.string(), name: z.string() }).nullish(),
})

export const postSchema = z.object({
  id: z.string(),
  token: z.string(),
  createdAt: z.string(),
  author: authorSchema,
  summary: z.array(regionSchema),
  content: z.array(regionSchema),
  /** Set when the post is marked NSFW: the label the Content Warning button shows. */
  contentWarning: z.string().nullish(),
  /** Reposts only: the original's content. `content` is then what the reposter added. */
  repostContent: z.array(regionSchema).nullish(),
  repostedSource: repostedSourceSchema.nullish(),
  /** Submission to an artist invite, if this post is one. */
  artistInviteSubmission: postSubmissionSchema.nullish(),
  /** Categories the post was submitted to; absent or empty when it has none. */
  categoryPosts: z.array(categoryPostSchema).nullish(),
  assets: z.array(assetSchema),
  postStats: z.object({
    lovesCount: z.number(),
    commentsCount: z.number(),
    viewsCount: z.number(),
    repostsCount: z.number(),
  }),
  currentUserState: z.object({
    watching: z.boolean(),
    loved: z.boolean(),
    reposted: z.boolean(),
  }),
})

export const commentSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  author: authorSchema,
  content: z.array(regionSchema),
  parentPost: z.object({ id: z.string() }).nullish(),
})

export const pageInfoSchema = z.object({ next: z.string().nullable(), isLastPage: z.boolean() })

export type Region = z.infer<typeof regionSchema>
export type ImageRegion = z.infer<typeof imageRegionSchema>
export type Asset = z.infer<typeof assetSchema>
export type PostSubmission = z.infer<typeof postSubmissionSchema>
export type Post = z.infer<typeof postSchema>
export type Comment = z.infer<typeof commentSchema>
export type PageInfo = z.infer<typeof pageInfoSchema>
