'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { errorMessage } from '@/lib/errors'
import {
  createCategoryUser,
  deleteCategoryUser,
  getCategoryDetails,
  quickSearchUsers,
  setSubscribedCategories,
} from '@/services/categories'
import { getUser } from '@/services/users'
import { failure, success, type ActionResult } from '@/types/action'
import {
  addRoleInputSchema,
  profileRoleInputSchema,
  type CategoryUser,
  type QuickSearchUser,
} from '@/types/category'
import type { UserRole } from '@/types/user'

/** The users the add-role dialog offers for what was typed. */
export const searchRoleUsers = async (query: unknown): Promise<ActionResult<QuickSearchUser[]>> => {
  const parsed = z.string().trim().min(1).max(100).safeParse(query)
  if (!parsed.success) return success([])
  try {
    return success(await quickSearchUsers(parsed.data))
  } catch (error) {
    return failure(errorMessage(error))
  }
}

/** Make a user a curator or a moderator of a category; answers with the category's roles as they are now. */
export const addCategoryRole = async (input: unknown): Promise<ActionResult<CategoryUser[]>> => {
  const parsed = addRoleInputSchema.safeParse(input)
  if (!parsed.success) return failure('Invalid role')
  const { slug, ...role } = parsed.data
  try {
    await createCategoryUser(role)
    const category = await getCategoryDetails(slug)
    revalidatePath('/discover', 'layout')
    return success(category.categoryUsers ?? [])
  } catch (error) {
    return failure(errorMessage(error))
  }
}

export const removeCategoryRole = async (categoryUserId: unknown): Promise<ActionResult> => {
  const parsed = z.string().min(1).safeParse(categoryUserId)
  if (!parsed.success) return failure('Invalid role')
  try {
    await deleteCategoryUser(parsed.data)
    revalidatePath('/discover', 'layout')
    return success(undefined)
  } catch (error) {
    return failure(errorMessage(error))
  }
}

/** The profile's Community Roles form: give a user a role in a category the viewer administers; answers with that user's roles as they are now. */
export const assignProfileRole = async (input: unknown): Promise<ActionResult<UserRole[]>> => {
  const parsed = profileRoleInputSchema.safeParse(input)
  if (!parsed.success) return failure('Invalid role')
  const { username, ...role } = parsed.data
  try {
    await createCategoryUser(role)
    const user = await getUser(username)
    revalidatePath(`/${username}`, 'layout')
    revalidatePath('/discover', 'layout')
    return success(user.categoryUsers ?? [])
  } catch (error) {
    return failure(errorMessage(error))
  }
}

/** The remove button of a role on a profile. */
export const removeProfileRole = async (categoryUserId: unknown, username: unknown): Promise<ActionResult> => {
  const parsed = z.tuple([z.string().min(1), z.string().min(1)]).safeParse([categoryUserId, username])
  if (!parsed.success) return failure('Invalid role')
  try {
    await deleteCategoryUser(parsed.data[0])
    revalidatePath(`/${parsed.data[1]}`, 'layout')
    revalidatePath('/discover', 'layout')
    return success(undefined)
  } catch (error) {
    return failure(errorMessage(error))
  }
}

/** Subscribe to or unsubscribe from categories: sends the viewer's whole new list, like the original. */
export const subscribeToCategories = async (categoryIds: unknown): Promise<ActionResult> => {
  const parsed = z.array(z.string().min(1)).max(200).safeParse(categoryIds)
  if (!parsed.success) return failure('Invalid categories')
  try {
    await setSubscribedCategories(parsed.data)
    revalidatePath('/', 'layout')
    return success(undefined)
  } catch (error) {
    return failure(errorMessage(error))
  }
}
