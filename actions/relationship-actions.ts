'use server'

import { revalidatePath } from 'next/cache'
import { restVoid } from '@/lib/api/client'
import { errorMessage } from '@/lib/errors'
import { failure, success, type ActionResult } from '@/types/action'

/** Follow (`next = true`) or unfollow a user. */
export const setFollowing = async (userId: string, next: boolean): Promise<ActionResult> => {
  try {
    await restVoid(`/api/v2/users/${encodeURIComponent(userId)}/add/${next ? 'friend' : 'inactive'}`, {
      method: 'POST',
    })
    revalidatePath('/', 'layout')
    return success(undefined)
  } catch (error) {
    return failure(errorMessage(error))
  }
}
