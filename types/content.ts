import { z } from 'zod'
import { avatarSchema, responsiveImageSchema } from './image'
import { postSchema } from './post'
import { authorSchema } from './user'

export const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  level: z.string().nullish(),
  description: z.string().nullish(),
  /** Tshirt sizes (small / regular / large / original), like avatars. */
  tileImage: avatarSchema.nullish(),
})

export const pageHeaderSchema = z.object({
  id: z.string(),
  kind: z.string(),
  header: z.string().nullish(),
  subheader: z.string().nullish(),
  image: responsiveImageSchema.nullish(),
  user: authorSchema.nullish(),
  ctaLink: z.object({ text: z.string().nullish(), url: z.string().nullish() }).nullish(),
})

export const editorialSchema = z.object({
  id: z.string(),
  kind: z.string(),
  title: z.string().nullish(),
  subtitle: z.string().nullish(),
  path: z.string().nullish(),
  url: z.string().nullish(),
  oneByOneImage: responsiveImageSchema.nullish(),
  twoByOneImage: responsiveImageSchema.nullish(),
  twoByTwoImage: responsiveImageSchema.nullish(),
  post: postSchema.nullish(),
})

export type Category = z.infer<typeof categorySchema>
export type PageHeader = z.infer<typeof pageHeaderSchema>
export type Editorial = z.infer<typeof editorialSchema>
