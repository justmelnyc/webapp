import { z } from 'zod'

/** Response of POST /api/v2/posts. Permissive: we only need the new post's identity. */
export const createPostResponseSchema = z
  .object({
    posts: z
      .object({ id: z.coerce.string(), token: z.string(), href: z.string().nullish() })
      .passthrough(),
  })
  .passthrough()

/** What the composer sends: text is the editor's HTML, embeds are what `post_previews` resolved. */
export const postBlockInputSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('text'), text: z.string() }),
  z.object({ kind: z.literal('image'), url: z.string().url(), alt: z.string().optional() }),
  z.object({
    kind: z.literal('embed'),
    service: z.string().min(1),
    url: z.string().url(),
    thumbnailLargeUrl: z.string(),
    embedId: z.string().min(1),
  }),
])

export const createPostInputSchema = z.object({
  blocks: z.array(postBlockInputSchema).min(1, 'Add some text or an image first'),
  categoryIds: z.array(z.string()),
  /** Post-level buy link, sent as `link_url` on every block. */
  buyLink: z.string().optional(),
})

export const updatePostInputSchema = createPostInputSchema.extend({ postId: z.string().min(1) })

export type CreatePostInput = z.infer<typeof createPostInputSchema>
export type CreatedPost = z.infer<typeof createPostResponseSchema>['posts']
export type UpdatePostInput = z.infer<typeof updatePostInputSchema>
export type PostBlockInput = z.infer<typeof postBlockInputSchema>

/** One block of a post's editable `body` (GET /api/v2/posts/:id): text HTML, an image URL or embed data. */
export const editableBlockSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('text'), data: z.string(), linkUrl: z.string().nullish() }),
  z.object({
    kind: z.literal('image'),
    data: z.object({ url: z.string().nullish(), alt: z.string().nullish() }).passthrough(),
    linkUrl: z.string().nullish(),
  }),
  z.object({
    kind: z.literal('embed'),
    data: z.object({
      service: z.string(),
      url: z.string(),
      thumbnailLargeUrl: z.string(),
      id: z.coerce.string(),
    }),
    linkUrl: z.string().nullish(),
  }),
])

export const editablePostResponseSchema = z.object({
  posts: z.object({
    id: z.coerce.string(),
    body: z.array(editableBlockSchema),
    links: z.object({ categories: z.array(z.coerce.string()).nullish() }).passthrough().nullish(),
  }),
})

/** Response of POST /api/v2/post_previews: the embed block the URL resolved to. */
export const postPreviewResponseSchema = z.object({
  postPreviews: z.object({
    body: z.array(
      z.object({
        kind: z.literal('embed'),
        data: z.object({ service: z.string(), url: z.string(), thumbnailLargeUrl: z.string(), id: z.coerce.string() }),
      }),
    ),
  }),
})

export type EditablePost = z.infer<typeof editablePostResponseSchema>['posts']
