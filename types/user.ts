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

export const userRoleSchema = z.object({
  id: z.string(),
  role: z.enum(['FEATURED', 'CURATOR', 'MODERATOR']),
  category: z.object({ id: z.string(), name: z.string(), slug: z.string() }),
})

/** Full profile from the GraphQL `findUser` query. */
export const userSchema = authorSchema.extend({
  settings: z.object({ isHireable: z.boolean().nullish(), isCollaborateable: z.boolean().nullish() }).nullish(),
  categoryUsers: z.array(userRoleSchema).nullish(),
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
  isHireable: z.boolean().nullish(),
  isCollaborateable: z.boolean().nullish(),
  /** The API sends the onboarding version as a string once saved ('3'), the token carries it as a number. */
  webOnboardingVersion: z.union([z.string(), z.number()]).nullish(),
  hasAvatarPresent: z.boolean().nullish(),
  hasCoverImagePresent: z.boolean().nullish(),
  isStaff: z.boolean().nullish(),
  /** A brand account: like staff, it gets "Analytics" in the profile menu. */
  isBrand: z.boolean().nullish(),
  /** `links.categories`: the categories whose curators and moderators this user may change (`selectCuratedCategoryIds`). */
  links: z.object({ categories: z.array(z.coerce.string()).nullish() }).nullish(),
  /** How many people the user blocked / muted: above zero, the settings page lists them. */
  blockedCount: z.number().nullish(),
  mutedCount: z.number().nullish(),
  /** The categories the user subscribed to. */
  followedCategoryIds: z.array(z.coerce.string()).nullish(),
})

export type Author = z.infer<typeof authorSchema>
export type User = z.infer<typeof userSchema>
export type UserRole = z.infer<typeof userRoleSchema>
export type Viewer = z.infer<typeof viewerSchema>
export type Relationship = z.infer<typeof relationshipSchema>
