'use server'

import { revalidatePath } from 'next/cache'
import { rest, restVoid } from '@/lib/api/client'
import { errorMessage } from '@/lib/errors'
import { buildPostBody } from '@/lib/post-body'
import { createPostResponseSchema } from '@/lib/schemas/post'
import { repostInputSchema } from '@/lib/schemas/repost'
import { getSession } from '@/lib/session'
import { getCategories } from '@/services/content'
import type { Category } from '@/types/content'
import { failure, success, type ActionResult } from '@/types/action'
import { normalizeBuyLink } from '@/utils/buy-link'

/** Repost a post, optionally with the reposter's own text (the original's `createPost(repostId)`). */
export const createRepost = async (input: unknown): Promise<ActionResult> => {
  const parsed = repostInputSchema.safeParse(input)
  if (!parsed.success) return failure('Could not repost this post')
  const { postId, blocks, buyLink } = parsed.data
  const body = buildPostBody(blocks, normalizeBuyLink(buyLink))
  try {
    await rest(`/api/v2/posts?repost_id=${encodeURIComponent(postId)}`, createPostResponseSchema, {
      method: 'POST',
      body: { body },
    })
    revalidatePath('/', 'layout')
    return success(undefined)
  } catch (error) {
    return failure(errorMessage(error))
  }
}

/** Undo the viewer's repost of a post. */
export const removeRepost = async (postId: string): Promise<ActionResult> => {
  try {
    await restVoid(`/api/v2/posts/${encodeURIComponent(postId)}/repost`, { method: 'DELETE' })
    revalidatePath('/', 'layout')
    return success(undefined)
  } catch (error) {
    return failure(errorMessage(error))
  }
}

export interface RepostContext {
  /** The signed-in reposter (the editor's "by @username" label). */
  username: string
  /** The categories the inline editor's selector offers (the omnibar gets the same list from the navbar). */
  categories: Category[]
}

/** What the inline repost editor needs beyond the post: who is reposting and the category list. */
export const loadRepostContext = async (): Promise<RepostContext> => {
  const [session, categories] = await Promise.all([getSession(), getCategories().catch((): Category[] => [])])
  return { username: session?.username ?? '', categories }
}
