'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { restVoid } from '@/lib/api/client'
import { errorMessage } from '@/lib/errors'
import { ONBOARDING_VERSION } from '@/constants/onboarding'
import { failure, success, type ActionResult } from '@/types/action'

const categoryIdsSchema = z.array(z.number().int().positive())

/** The original's `saveProfile({ web_onboarding_version })` when the creator type step is done. */
export const completeCreatorTypeStep = async (): Promise<ActionResult> => {
  try {
    await restVoid('/api/v2/profile', { method: 'PATCH', body: { web_onboarding_version: ONBOARDING_VERSION } })
    return success(undefined)
  } catch (error) {
    return failure(errorMessage(error))
  }
}

/** The original's `followCategories(ids, false)`: follow the picked categories and their featured people. */
export const followCategories = async (ids: unknown): Promise<ActionResult> => {
  const parsed = categoryIdsSchema.safeParse(ids)
  if (!parsed.success) return failure('Those categories could not be saved')
  try {
    await restVoid('/api/v2/profile/followed_categories', {
      method: 'PUT',
      body: { followed_category_ids: parsed.data, disable_follows: false },
    })
    revalidatePath('/', 'layout')
    return success(undefined)
  } catch (error) {
    return failure(errorMessage(error))
  }
}
