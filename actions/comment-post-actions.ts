'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { rest } from '@/lib/api/client'
import { errorMessage } from '@/lib/errors'
import { COMMENT_MAX_LENGTH, commentToHtml } from '@/lib/schemas/comment'
import { failure, success, type ActionResult } from '@/types/action'

/** What the comment editor sends: its blocks in order (text, and pictures that already finished uploading). */
const commentRegionsSchema = z
  .array(
    z.discriminatedUnion('kind', [
      z.object({ kind: z.literal('text'), text: z.string() }),
      z.object({ kind: z.literal('image'), url: z.url({ protocol: /^https?$/ }) }),
    ]),
  )
  .refine(
    (regions) => regions.some((r) => r.kind === 'image' || r.text.trim().length > 0),
    'Write something first',
  )
  .refine(
    (regions) =>
      regions.reduce((total, r) => total + (r.kind === 'text' ? r.text.trim().length : 0), 0) <=
      COMMENT_MAX_LENGTH,
    `Keep it under ${COMMENT_MAX_LENGTH} characters`,
  )

export type CommentRegionInput = { kind: 'text'; text: string } | { kind: 'image'; url: string }

const createdSchema = z.object({ comments: z.object({ id: z.string() }).passthrough() })

/** Post a comment made of text and image blocks (the original's comment body regions). */
export const createCommentFromBlocks = async (
  postId: string,
  regions: CommentRegionInput[],
): Promise<ActionResult<{ id: string }>> => {
  const parsed = commentRegionsSchema.safeParse(regions)
  if (!parsed.success) return failure(parsed.error.issues[0]?.message ?? 'Invalid comment')
  const body = parsed.data.flatMap((region): { kind: string; data: unknown }[] => {
    if (region.kind === 'image') return [{ kind: 'image', data: { url: region.url } }]
    const html = commentToHtml(region.text)
    return html ? [{ kind: 'text', data: html }] : []
  })
  try {
    const data = await rest(`/api/v2/posts/${postId}/comments`, createdSchema, {
      method: 'POST',
      body: { body },
    })
    revalidatePath('/', 'layout')
    return success({ id: data.comments.id })
  } catch (error) {
    return failure(errorMessage(error))
  }
}
