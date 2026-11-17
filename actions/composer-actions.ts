'use server'

import { revalidatePath } from 'next/cache'
import { rest, restVoid } from '@/lib/api/client'
import { errorMessage } from '@/lib/errors'
import { createPostInputSchema, createPostResponseSchema, type CreatedPost } from '@/lib/schemas/post'
import { failure, success, type ActionResult } from '@/types/action'
import { textToHtml } from '@/utils/post-html'

type ApiBlock = { kind: 'text'; data: string } | { kind: 'image'; data: { url: string; alt?: string } }

export const createPost = async (input: unknown): Promise<ActionResult<CreatedPost>> => {
  const parsed = createPostInputSchema.safeParse(input)
  if (!parsed.success) return failure(parsed.error.issues[0]?.message ?? 'Invalid post')
  const body: ApiBlock[] = []
  for (const block of parsed.data.blocks) {
    if (block.kind === 'image') {
      body.push({ kind: 'image', data: block.alt ? { url: block.url, alt: block.alt } : { url: block.url } })
      continue
    }
    const html = textToHtml(block.text)
    if (html) body.push({ kind: 'text', data: html })
  }
  if (body.length === 0) return failure('Add some text or an image first')
  try {
    const data = await rest('/api/v2/posts', createPostResponseSchema, {
      method: 'POST',
      body: { body, category_ids: parsed.data.categoryIds },
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
