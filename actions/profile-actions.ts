'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { rest } from '@/lib/api/client'
import { errorMessage, isApiError } from '@/lib/errors'
import { preferencePatch } from '@/lib/preferences'
import {
  creatorTypeIdsSchema,
  credentialErrorsSchema,
  credentialsSchema,
  type CredentialFieldErrors,
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

export type CredentialsResult = ActionResult | { ok: false; error: string; fields: CredentialFieldErrors }

/** The API's 422 names the offending fields (`attrs`, snake_case); map them onto the form's. */
const fieldErrorsOf = (error: unknown): CredentialFieldErrors | null => {
  if (!isApiError(error) || error.status !== 422) return null
  try {
    const parsed = credentialErrorsSchema.safeParse(JSON.parse(error.detail))
    if (!parsed.success) return null
    const { attrs } = parsed.data.errors
    const fields: CredentialFieldErrors = {}
    if (attrs.username) fields.username = attrs.username
    if (attrs.email) fields.email = attrs.email
    if (attrs.password) fields.password = attrs.password
    if (attrs.current_password) fields.currentPassword = attrs.current_password
    return fields
  } catch {
    return null
  }
}

export const saveCredentials = async (input: unknown): Promise<CredentialsResult> => {
  const parsed = credentialsSchema.safeParse(input)
  if (!parsed.success) return failure(parsed.error.issues[0]?.message ?? 'Check your details')
  const { username, email, password, currentPassword } = parsed.data
  try {
    await rest('/api/v2/profile', profileResponse, {
      method: 'PATCH',
      body: { username, email, current_password: currentPassword, ...(password ? { password } : {}) },
    })
    revalidatePath('/', 'layout')
    return success(undefined)
  } catch (error) {
    const fields = fieldErrorsOf(error)
    if (fields) return { ok: false, error: 'Your changes could not be saved', fields }
    return failure(errorMessage(error))
  }
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
