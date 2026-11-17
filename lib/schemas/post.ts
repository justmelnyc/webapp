import { z } from 'zod'

/** Response of POST /api/v2/posts. Permissive: we only need the new post's identity. */
export const createPostResponseSchema = z
  .object({
    posts: z
      .object({ id: z.coerce.string(), token: z.string(), href: z.string().nullish() })
      .passthrough(),
  })
  .passthrough()

export const createPostInputSchema = z.object({
  blocks: z
    .array(
      z.discriminatedUnion('kind', [
        z.object({ kind: z.literal('text'), text: z.string() }),
        z.object({ kind: z.literal('image'), url: z.string().url(), alt: z.string().optional() }),
      ]),
    )
    .min(1, 'Add some text or an image first'),
  categoryIds: z.array(z.string()),
})

export type CreatePostInput = z.infer<typeof createPostInputSchema>
export type CreatedPost = z.infer<typeof createPostResponseSchema>['posts']
