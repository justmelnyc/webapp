'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { rest } from '@/lib/api/client'
import { errorMessage } from '@/lib/errors'
import { commentBodyOf, commentRegionsSchema, type CommentRegionInput } from '@/lib/comment-regions'
import { failure, success, type ActionResult } from '@/types/action'

const createdSchema = z.object({ comments: z.object({ id: z.string() }).passthrough() })

/** Post a comment made of text and image blocks (the original's comment body regions). */
export const createCommentFromBlocks = async (
  postId: string,
  regions: CommentRegionInput[],
): Promise<ActionResult<{ id: string }>> => {
  const parsed = commentRegionsSchema.safeParse(regions)
  if (!parsed.success) return failure(parsed.error.issues[0]?.message ?? 'Invalid comment')
  try {
    const data = await rest(`/api/v2/posts/${postId}/comments`, createdSchema, {
      method: 'POST',
      body: { body: commentBodyOf(parsed.data) },
    })
    revalidatePath('/', 'layout')
    return success({ id: data.comments.id })
  } catch (error) {
    return failure(errorMessage(error))
  }
}
