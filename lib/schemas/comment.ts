import { z } from 'zod'

export const COMMENT_MAX_LENGTH = 2000

export const commentSchema = z.object({
  body: z.string().trim().min(1, 'Write something first').max(COMMENT_MAX_LENGTH, `Keep it under ${COMMENT_MAX_LENGTH} characters`),
})

export type CommentInput = z.infer<typeof commentSchema>

export const commentQuerySchema = z.object({
  postId: z.string().min(1),
  before: z.string().min(1).nullish(),
})

const escapeHtml = (text: string): string =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')

/** Escape user text and wrap each paragraph (blank-line separated) in <p>, single newlines become <br>. */
export const commentToHtml = (text: string): string =>
  text
    .trim()
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, '<br>')}</p>`)
    .join('')
