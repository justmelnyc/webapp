'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { rest, restVoid } from '@/lib/api/client'
import { errorMessage } from '@/lib/errors'
import { commentSchema, commentToHtml } from '@/lib/schemas/comment'
import { failure, success, type ActionResult } from '@/types/action'

const createdSchema = z.object({ comments: z.object({ id: z.string() }).passthrough() })

/** Post a comment. `text` is plain text; it is escaped and wrapped in paragraphs here. */
export const createComment = async (postId: string, text: string): Promise<ActionResult<{ id: string }>> => {
  const parsed = commentSchema.safeParse({ body: text })
  if (!parsed.success) return failure(parsed.error.issues[0]?.message ?? 'Invalid comment')
  try {
    const data = await rest(`/api/v2/posts/${postId}/comments`, createdSchema, {
      method: 'POST',
      body: { body: [{ kind: 'text', data: commentToHtml(parsed.data.body) }] },
    })
    revalidatePath('/', 'layout')
    return success({ id: data.comments.id })
  } catch (error) {
    return failure(errorMessage(error))
  }
}

/** Delete one of the viewer's own comments. */
export const deleteComment = async (postId: string, commentId: string): Promise<ActionResult> => {
  try {
    await restVoid(`/api/v2/posts/${postId}/comments/${commentId}`, { method: 'DELETE' })
    revalidatePath('/', 'layout')
    return success(undefined)
  } catch (error) {
    return failure(errorMessage(error))
  }
}
