import { z } from 'zod'
import { COMMENT_MAX_LENGTH, commentToHtml } from '@/lib/schemas/comment'

/** What the comment editor sends: its blocks in order (text, and pictures that already finished uploading). */
export const commentRegionsSchema = z
  .array(
    z.discriminatedUnion('kind', [
      z.object({ kind: z.literal('text'), text: z.string() }),
      z.object({
        kind: z.literal('image'),
        url: z.url({ protocol: /^https?$/ }),
        alt: z.string().optional(),
      }),
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

export type CommentRegionInput =
  | { kind: 'text'; text: string }
  | { kind: 'image'; url: string; alt?: string }

/** Editor regions -> the API's body regions (text escaped and wrapped in paragraphs, blank text dropped). */
export const commentBodyOf = (
  regions: z.infer<typeof commentRegionsSchema>,
): { kind: string; data: unknown }[] =>
  regions.flatMap((region): { kind: string; data: unknown }[] => {
    if (region.kind === 'image') {
      return [{ kind: 'image', data: region.alt ? { url: region.url, alt: region.alt } : { url: region.url } }]
    }
    const html = commentToHtml(region.text)
    return html ? [{ kind: 'text', data: html }] : []
  })
