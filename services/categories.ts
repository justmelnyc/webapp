import 'server-only'
import { z } from 'zod'
import { ADMINISTERED_CATEGORIES, CATEGORY_DETAILS, USER_QUICK_SEARCH } from '@/constants/queries'
import { graphql, restVoid } from '@/lib/api/client'
import {
  administeredCategorySchema,
  categoryDetailsSchema,
  quickSearchUserSchema,
  type AdministeredCategory,
  type CategoryDetails,
  type QuickSearchUser,
} from '@/types/category'

/** A category with its curators and moderators (the original's `loadCategoryDetails`). */
export const getCategoryDetails = async (slug: string): Promise<CategoryDetails> => {
  const variables = { slug, roles: ['CURATOR', 'MODERATOR'] }
  const data = await graphql(
    CATEGORY_DETAILS,
    variables,
    z.object({ category: categoryDetailsSchema }),
  )
  return data.category
}

/** Up to ten users whose name matches, for the add-role dialog (`userQuickSearch`). */
export const quickSearchUsers = async (query: string): Promise<QuickSearchUser[]> => {
  const schema = z.object({ searchUsers: z.object({ users: z.array(quickSearchUserSchema) }) })
  const data = await graphql(USER_QUICK_SEARCH, { query }, schema)
  return data.searchUsers.users
}

/** The categories whose roles the viewer may hand out (`searchAdministratedCategories`): none when logged out. */
export const getAdministeredCategories = async (): Promise<AdministeredCategory[]> => {
  const schema = z.object({ searchCategories: z.object({ categories: z.array(administeredCategorySchema) }) })
  const data = await graphql(ADMINISTERED_CATEGORIES, { administered: true }, schema)
  return data.searchCategories.categories
}

interface NewRole {
  userId: string
  categoryId: string
  /** 'featured' only comes from the profile's Community Roles form. */
  role: 'featured' | 'curator' | 'moderator'
}

/** `addToCategory`. */
export const createCategoryUser = async ({ userId, categoryId, role }: NewRole): Promise<void> =>
  restVoid('/api/v2/category_users', {
    method: 'POST',
    body: { user_id: userId, category_id: categoryId, role },
  })

/** `removeFromCategory`. */
export const deleteCategoryUser = async (categoryUserId: string): Promise<void> =>
  restVoid(`/api/v2/category_users/${encodeURIComponent(categoryUserId)}`, { method: 'DELETE' })

/** `followCategories(ids, true)`: replaces the list of categories the viewer subscribed to. */
export const setSubscribedCategories = async (categoryIds: string[]): Promise<void> =>
  restVoid('/api/v2/profile/followed_categories', {
    method: 'PUT',
    body: { followed_category_ids: categoryIds, disable_follows: true },
  })
