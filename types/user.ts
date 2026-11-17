import { z } from 'zod'
import { avatarSchema, responsiveImageSchema } from './image'

export const relationshipSchema = z.enum(['self', 'friend', 'noise', 'inactive', 'block', 'mute', 'none'])

/** The minimum a post or comment needs to show who wrote it. */
export const authorSchema = z.object({
  id: z.string(),
  username: z.string(),
  name: z.string().nullish(),
  avatar: avatarSchema.nullish(),
  currentUserState: z.object({ relationshipPriority: z.string().nullish() }).nullish(),
})

export const userStatsSchema = z.object({
  followersCount: z.number(),
  followingCount: z.number(),
  lovesCount: z.number(),
  postsCount: z.number(),
  totalViewsCount: z.number(),
})

/** Full profile from the GraphQL `findUser` query. */
export const userSchema = authorSchema.extend({
  location: z.string().nullish(),
  formattedShortBio: z.string().nullish(),
  coverImage: responsiveImageSchema.nullish(),
  externalLinksList: z.array(z.object({ url: z.string(), text: z.string().nullish() })).nullish(),
  userStats: userStatsSchema,
})

/** The signed-in user from `GET /api/v2/profile` (flat v2 shape). */
export const viewerSchema = z.object({
  id: z.string(),
  username: z.string(),
  name: z.string().nullish(),
  email: z.string().nullish(),
  avatar: avatarSchema.nullish(),
  coverImage: responsiveImageSchema.nullish(),
  shortBio: z.string().nullish(),
  location: z.string().nullish(),
  externalLinksList: z.array(z.object({ url: z.string(), text: z.string().nullish() })).nullish(),
})

export type Author = z.infer<typeof authorSchema>
export type User = z.infer<typeof userSchema>
export type Viewer = z.infer<typeof viewerSchema>
export type Relationship = z.infer<typeof relationshipSchema>
