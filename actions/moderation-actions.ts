'use server'

import { revalidatePath } from 'next/cache'
import { restVoid } from '@/lib/api/client'
import { errorMessage } from '@/lib/errors'
import {
  flagKindSchema,
  messageKindSchema,
  messageSchema,
  relationshipPrioritySchema,
} from '@/lib/schemas/moderation'
import { failure, success, type ActionResult } from '@/types/action'

const post = async (path: string, body?: unknown): Promise<ActionResult> => {
  try {
    await restVoid(path, { method: 'POST', body })
    return success(undefined)
  } catch (error) {
    return failure(errorMessage(error))
  }
}

/** Set the viewer's relationship with a user: follow, unfollow, block, mute (or lift either with `inactive`). */
export const setRelationship = async (userId: string, priority: string): Promise<ActionResult> => {
  const parsed = relationshipPrioritySchema.safeParse(priority)
  if (!parsed.success) return failure('Unknown relationship')
  const result = await post(`/api/v2/users/${encodeURIComponent(userId)}/add/${parsed.data}`)
  if (result.ok) revalidatePath('/', 'layout')
  return result
}

/** Report a post, a user or a comment (FlagDialog). */
export const flagPost = async (postId: string, kind: string): Promise<ActionResult> => {
  const parsed = flagKindSchema.safeParse(kind)
  return parsed.success ? post(`/api/v2/posts/${encodeURIComponent(postId)}/flag/${parsed.data}`) : failure('Unknown reason')
}

export const flagUser = async (username: string, kind: string): Promise<ActionResult> => {
  const parsed = flagKindSchema.safeParse(kind)
  return parsed.success ? post(`/api/v2/users/~${encodeURIComponent(username)}/flag/${parsed.data}`) : failure('Unknown reason')
}

export const flagComment = async (postId: string, commentId: string, kind: string): Promise<ActionResult> => {
  const parsed = flagKindSchema.safeParse(kind)
  if (!parsed.success) return failure('Unknown reason')
  return post(`/api/v2/posts/${encodeURIComponent(postId)}/comments/${encodeURIComponent(commentId)}/flag/${parsed.data}`)
}

/** The Collab / Hire dialogs' message to a user. */
export const messageUser = async (userId: string, kind: string, message: string): Promise<ActionResult> => {
  const parsedKind = messageKindSchema.safeParse(kind)
  const parsedMessage = messageSchema.safeParse({ message })
  if (!parsedKind.success) return failure('Unknown message type')
  if (!parsedMessage.success) return failure(parsedMessage.error.issues[0]?.message ?? 'Invalid message')
  return post(`/api/v2/users/${encodeURIComponent(userId)}/${parsedKind.data}`, parsedMessage.data)
}
