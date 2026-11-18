import { z } from 'zod'
import { postBlockInputSchema } from './post'

/** What the inline repost editor submits: the post being reposted plus what the reposter added (maybe nothing). */
export const repostInputSchema = z.object({
  postId: z.string().min(1),
  blocks: z.array(postBlockInputSchema),
  buyLink: z.string().optional(),
})

export type RepostInput = z.infer<typeof repostInputSchema>
