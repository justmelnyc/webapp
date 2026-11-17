'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { rest } from '@/lib/api/client'
import { errorMessage } from '@/lib/errors'
import { preferencePatch } from '@/lib/preferences'
import {
  creatorTypeIdsSchema,
  credentialsSchema,
  imageKindSchema,
  infoSchema,
  preferenceKeySchema,
} from '@/lib/schemas/profile'
import { failure, success, type ActionResult } from '@/types/action'

const profileResponse = z.object({ users: z.object({ id: z.string() }) })

const patchProfile = async (body: Record<string, unknown>): Promise<ActionResult> => {
  try {
    await rest('/api/v2/profile', profileResponse, { method: 'PATCH', body })
    revalidatePath('/', 'layout')
    return success(undefined)
  } catch (error) {
    return failure(errorMessage(error))
  }
}

export const saveCredentials = async (input: unknown): Promise<ActionResult> => {
  const parsed = credentialsSchema.safeParse(input)
  if (!parsed.success) return failure(parsed.error.issues[0]?.message ?? 'Check your details')
  const { username, email, password, currentPassword } = parsed.data
  // The mock API ignores `password` and `current_password`; they are sent as the original sends them.
  return patchProfile({ username, email, current_password: currentPassword, ...(password ? { password } : {}) })
}

export const saveInfo = async (input: unknown): Promise<ActionResult> => {
  const parsed = infoSchema.safeParse(input)
  if (!parsed.success) return failure(parsed.error.issues[0]?.message ?? 'Check your details')
  const { name, bio, location, links } = parsed.data
  return patchProfile({
    name,
    unsanitized_short_bio: bio,
    location,
    external_links: links.map(({ url, text }) => ({ url, text: text || url })),
  })
}

export const saveCreatorTypes = async (ids: unknown): Promise<ActionResult> => {
  const parsed = creatorTypeIdsSchema.safeParse(ids)
  if (!parsed.success) return failure('That creator type could not be saved')
  return patchProfile({ creator_type_category_ids: parsed.data })
}

export const saveProfileImage = async (kind: unknown, url: unknown): Promise<ActionResult> => {
  const parsedKind = imageKindSchema.safeParse(kind)
  const parsedUrl = z.string().url().safeParse(url)
  if (!parsedKind.success || !parsedUrl.success) return failure('That image could not be saved')
  return patchProfile(
    parsedKind.data === 'avatar' ? { remote_avatar_url: parsedUrl.data } : { remote_cover_image_url: parsedUrl.data },
  )
}

export const savePreference = async (key: unknown, value: unknown): Promise<ActionResult> => {
  const parsedKey = preferenceKeySchema.safeParse(key)
  const parsedValue = z.boolean().safeParse(value)
  if (!parsedKey.success || !parsedValue.success) return failure('That setting could not be saved')
  return patchProfile(preferencePatch(parsedKey.data, parsedValue.data))
}
