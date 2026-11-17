'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { rest } from '@/lib/api/client'
import { errorMessage } from '@/lib/errors'
import { imageKindSchema, preferenceKeySchema, profileSchema } from '@/lib/schemas/profile'
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

export const saveProfile = async (input: unknown): Promise<ActionResult> => {
  const parsed = profileSchema.safeParse(input)
  if (!parsed.success) return failure(parsed.error.issues[0]?.message ?? 'Check your details')
  const { name, username, email, bio, location, links } = parsed.data
  return patchProfile({
    name,
    username,
    email,
    unsanitized_short_bio: bio,
    location,
    external_links: links.map(({ url, text }) => ({ url, text: text || url })),
  })
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
  return patchProfile({ [parsedKey.data]: parsedValue.data })
}
