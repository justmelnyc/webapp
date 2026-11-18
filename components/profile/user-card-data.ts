import 'server-only'
import { z } from 'zod'
import { graphql, rest } from '@/lib/api/client'
import { avatarSchema, responsiveImageSchema } from '@/types/image'
import type { UserCardData } from '@/components/profile/user-card'
import type { UserListKind } from '@/services/users'

const IMAGE = '{ url metadata { width height type size } }'
const AVATAR = `{ small ${IMAGE} regular ${IMAGE} large ${IMAGE} original ${IMAGE} }`
const COVER = `{ xhdpi ${IMAGE} hdpi ${IMAGE} mdpi ${IMAGE} ldpi ${IMAGE} optimized ${IMAGE} original ${IMAGE} }`

const SEARCH_USER_CARDS = `
  query($query: String!) {
    searchUsers(query: $query, perPage: 10) {
      users {
        id username name avatar ${AVATAR} coverImage ${COVER} formattedShortBio
        currentUserState { relationshipPriority }
        settings { isHireable isCollaborateable }
        userStats { followersCount followingCount lovesCount postsCount }
      }
    }
  }
`

/** The v2 follower / following lists: stats are flat on the user. */
const flatUserSchema = z.object({
  id: z.string(),
  username: z.string(),
  name: z.string().nullish(),
  avatar: avatarSchema.nullish(),
  coverImage: responsiveImageSchema.nullish(),
  formattedShortBio: z.string().nullish(),
  relationshipPriority: z.string().nullish(),
  isHireable: z.boolean().nullish(),
  isCollaborateable: z.boolean().nullish(),
  followersCount: z.number().default(0),
  followingCount: z.number().default(0),
  lovesCount: z.number().default(0),
  postsCount: z.number().default(0),
})

const searchUserSchema = z.object({
  id: z.string(),
  username: z.string(),
  name: z.string().nullish(),
  avatar: avatarSchema.nullish(),
  coverImage: responsiveImageSchema.nullish(),
  formattedShortBio: z.string().nullish(),
  currentUserState: z.object({ relationshipPriority: z.string().nullish() }).nullish(),
  settings: z.object({ isHireable: z.boolean().nullish(), isCollaborateable: z.boolean().nullish() }).nullish(),
  userStats: z.object({
    followersCount: z.number().default(0),
    followingCount: z.number().default(0),
    lovesCount: z.number().default(0),
    postsCount: z.number().default(0),
  }),
})

export const getFollowCards = async (username: string, kind: UserListKind): Promise<UserCardData[]> => {
  const data = await rest(
    `/api/v2/users/~${encodeURIComponent(username)}/${kind}?per_page=50`,
    z.object({ users: z.array(flatUserSchema) }),
  )
  return data.users.map(({ formattedShortBio, ...user }) => ({ ...user, bioHtml: formattedShortBio }))
}

export const searchUserCards = async (query: string): Promise<UserCardData[]> => {
  if (!query.trim()) return []
  const data = await graphql(
    SEARCH_USER_CARDS,
    { query },
    z.object({ searchUsers: z.object({ users: z.array(searchUserSchema) }) }),
  )
  return data.searchUsers.users.map(({ formattedShortBio, currentUserState, settings, userStats, ...user }) => ({
    ...user,
    ...userStats,
    isHireable: settings?.isHireable,
    isCollaborateable: settings?.isCollaborateable,
    bioHtml: formattedShortBio,
    relationshipPriority: currentUserState?.relationshipPriority,
  }))
}
