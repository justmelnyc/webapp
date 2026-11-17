import 'server-only'
import { z } from 'zod'
import { graphql, rest } from '@/lib/api/client'
import { FIND_USER, SEARCH_USERS } from '@/constants/queries'
import { authorSchema, userSchema, viewerSchema, type Author, type User } from '@/types/user'

const userEnvelope = z.object({ findUser: userSchema })
const searchEnvelope = z.object({
  searchUsers: z.object({ users: z.array(authorSchema.extend({ formattedShortBio: z.string().nullish() })) }),
})
const flatUsersEnvelope = z.object({ users: z.array(viewerSchema.extend({ formattedShortBio: z.string().nullish() })) })

/** Throws NotFoundError when the user does not exist. */
export const getUser = async (username: string): Promise<User> => {
  const data = await graphql(FIND_USER, { username }, userEnvelope)
  return data.findUser
}

export const searchUsers = async (query: string): Promise<Author[]> => {
  if (!query.trim()) return []
  const data = await graphql(SEARCH_USERS, { query }, searchEnvelope)
  return data.searchUsers.users
}

export type UserListKind = 'followers' | 'following'

export const getUserList = async (username: string, kind: UserListKind) => {
  const data = await rest(`/api/v2/users/~${encodeURIComponent(username)}/${kind}?per_page=50`, flatUsersEnvelope)
  return data.users
}
