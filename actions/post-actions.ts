'use server'

import { revalidatePath } from 'next/cache'
import { restVoid } from '@/lib/api/client'
import { errorMessage } from '@/lib/errors'
import { failure, success, type ActionResult } from '@/types/action'

const run = async (work: () => Promise<void>): Promise<ActionResult> => {
  try {
    await work()
    revalidatePath('/', 'layout')
    return success(undefined)
  } catch (error) {
    return failure(errorMessage(error))
  }
}

/** Love (`next = true`) or unlove a post. */
export const setLoved = async (postId: string, next: boolean): Promise<ActionResult> =>
  run(() =>
    next
      ? restVoid(`/api/v2/posts/${postId}/loves`, { method: 'POST' })
      : restVoid(`/api/v2/posts/${postId}/love`, { method: 'DELETE' }),
  )

/** Watch (`next = true`) or unwatch a post's comments. */
export const setWatching = async (postId: string, next: boolean): Promise<ActionResult> =>
  run(() =>
    next
      ? restVoid(`/api/v2/posts/${postId}/watches`, { method: 'POST' })
      : restVoid(`/api/v2/posts/${postId}/watch`, { method: 'DELETE' }),
  )
