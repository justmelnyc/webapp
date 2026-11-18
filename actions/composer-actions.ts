'use server'

import { revalidatePath } from 'next/cache'
import { rest, restVoid } from '@/lib/api/client'
import { buildPostBody } from '@/lib/post-body'
import { errorMessage } from '@/lib/errors'
import { createPostInputSchema, createPostResponseSchema, type CreatedPost } from '@/lib/schemas/post'
import { failure, success, type ActionResult } from '@/types/action'
import { normalizeBuyLink } from '@/utils/buy-link'

export const createPost = async (input: unknown): Promise<ActionResult<CreatedPost>> => {
  const parsed = createPostInputSchema.safeParse(input)
  if (!parsed.success) return failure(parsed.error.issues[0]?.message ?? 'Invalid post')
  const body = buildPostBody(parsed.data.blocks, normalizeBuyLink(parsed.data.buyLink))
  if (body.length === 0) return failure('Add some text or an image first')
  try {
    const data = await rest('/api/v2/posts', createPostResponseSchema, {
      method: 'POST',
      body: {
        body,
        category_ids: parsed.data.categoryIds,
        ...(parsed.data.artistInviteId ? { artist_invite_id: parsed.data.artistInviteId } : {}),
      },
    })
    revalidatePath('/', 'layout')
    return success(data.posts)
  } catch (error) {
    return failure(errorMessage(error))
  }
}

export const deletePost = async (postId: string): Promise<ActionResult> => {
  try {
    await restVoid(`/api/v2/posts/${encodeURIComponent(postId)}`, { method: 'DELETE' })
    revalidatePath('/', 'layout')
    return success(undefined)
  } catch (error) {
    return failure(errorMessage(error))
  }
}
