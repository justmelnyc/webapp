import { z } from 'zod'
import { commentSchema, pageInfoSchema, postSchema } from './post'

export const streamKinds = ['FEATURED', 'TRENDING', 'RECENT', 'SHOP'] as const
export const streamKindSchema = z.enum(streamKinds)
export type StreamKind = z.infer<typeof streamKindSchema>

/** Describes which feed to load. Serializable so it can travel in a URL or query key. */
export const streamSpecSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('global'), kind: streamKindSchema }),
  z.object({ type: z.literal('following'), kind: streamKindSchema.optional() }),
  z.object({ type: z.literal('subscribed'), kind: streamKindSchema }),
  z.object({ type: z.literal('category'), slug: z.string(), kind: streamKindSchema }),
  z.object({ type: z.literal('user'), username: z.string() }),
  z.object({ type: z.literal('loves'), username: z.string() }),
  z.object({ type: z.literal('search'), terms: z.string() }),
])
export type StreamSpec = z.infer<typeof streamSpecSchema>

export const postPageSchema = pageInfoSchema.extend({ posts: z.array(postSchema) })
export type PostPage = z.infer<typeof postPageSchema>

export const commentPageSchema = pageInfoSchema.extend({ comments: z.array(commentSchema) })
export type CommentPage = z.infer<typeof commentPageSchema>
