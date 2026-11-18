'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { rest } from '@/lib/api/client'
import { errorMessage } from '@/lib/errors'
import { buildPostBody } from '@/lib/post-body'
import { getCategories } from '@/services/content'
import type { Category } from '@/types/content'
import {
  createPostResponseSchema,
  editablePostResponseSchema,
  postPreviewResponseSchema,
  updatePostInputSchema,
  type EditablePost,
} from '@/lib/schemas/post'
import { failure, success, type ActionResult } from '@/types/action'
import { normalizeBuyLink } from '@/utils/buy-link'
import { cleanHtml } from '@/utils/sanitize'

/** The post as the inline editor needs it, with the categories it was posted into (for the disabled selector). */
export type EditablePostWithCategories = EditablePost & { categories: Category[] }

export interface ResolvedEmbed {
  service: string
  url: string
  thumbnailLargeUrl: string
  embedId: string
}

/** The original's `postPreviews`: ask the API to resolve a pasted media URL into an embed region. */
export const resolveEmbed = async (url: unknown): Promise<ActionResult<ResolvedEmbed>> => {
  const parsed = z.string().url().safeParse(url)
  if (!parsed.success) return failure('That link could not be embedded')
  try {
    const data = await rest('/api/v2/post_previews', postPreviewResponseSchema, {
      method: 'POST',
      body: { body: [{ kind: 'embed', data: { url: parsed.data } }] },
    })
    const block = data.postPreviews.body[0]
    if (!block) return failure('That link could not be embedded')
    const { service, url: embedUrl, thumbnailLargeUrl, id } = block.data
    return success({ service, url: embedUrl, thumbnailLargeUrl, embedId: id })
  } catch (error) {
    return failure(errorMessage(error))
  }
}

/** The original's `loadEditablePost`: the post as the editor needs it (raw `body`), text sanitized. */
export const loadEditablePost = async (postId: unknown): Promise<ActionResult<EditablePostWithCategories>> => {
  const parsed = z.string().min(1).safeParse(postId)
  if (!parsed.success) return failure('That post could not be loaded')
  try {
    const data = await rest(`/api/v2/posts/${encodeURIComponent(parsed.data)}?comment_count=false`, editablePostResponseSchema)
    const body = data.posts.body.map((block) => (block.kind === 'text' ? { ...block, data: cleanHtml(block.data) } : block))
    const postedInto = (data.posts.links?.categories ?? []).map(String)
    const categories = postedInto.length > 0 ? (await getCategories()).filter((c) => postedInto.includes(c.id)) : []
    return success({ ...data.posts, body, categories })
  } catch (error) {
    return failure(errorMessage(error))
  }
}

export const updatePost = async (input: unknown): Promise<ActionResult> => {
  const parsed = updatePostInputSchema.safeParse(input)
  if (!parsed.success) return failure(parsed.error.issues[0]?.message ?? 'Invalid post')
  const body = buildPostBody(parsed.data.blocks, normalizeBuyLink(parsed.data.buyLink))
  if (body.length === 0) return failure('Add some text or an image first')
  try {
    await rest(`/api/v2/posts/${encodeURIComponent(parsed.data.postId)}`, createPostResponseSchema, {
      method: 'PATCH',
      body: { body },
    })
    revalidatePath('/', 'layout')
    return success(undefined)
  } catch (error) {
    return failure(errorMessage(error))
  }
}
