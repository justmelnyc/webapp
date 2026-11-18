import 'server-only'
import { z } from 'zod'
import { graphql } from '@/lib/api/client'
import { COMMENTS, FIND_POST } from '@/constants/queries'
import { sanitizeComment, sanitizePost } from '@/services/sanitize'
import { postSchema, type Post } from '@/types/post'
import { commentPageSchema, type CommentPage } from '@/types/stream'

const postEnvelope = z.object({ post: postSchema })
const commentsEnvelope = z.object({ commentStream: commentPageSchema })

/** Throws NotFoundError when the post does not exist. */
export const getPost = async (username: string, token: string): Promise<Post> => {
  const data = await graphql(FIND_POST, { username, token }, postEnvelope)
  return sanitizePost(data.post)
}

export const getComments = async (postId: string, before?: string | null): Promise<CommentPage> => {
  const data = await graphql(COMMENTS, { id: postId, perPage: '10', before: before ?? undefined }, commentsEnvelope)
  return { ...data.commentStream, comments: data.commentStream.comments.map(sanitizeComment) }
}
