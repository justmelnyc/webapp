import { z } from 'zod'

const metadataSchema = z
  .object({
    width: z.number().nullish(),
    height: z.number().nullish(),
    type: z.string().nullish(),
    size: z.number().nullish(),
  })
  .nullish()

export const imageVersionSchema = z.object({ url: z.string().nullable(), metadata: metadataSchema })

const version = imageVersionSchema.nullish()

/** Avatars come in a few fixed sizes. */
export const avatarSchema = z.object({
  small: version,
  regular: version,
  large: version,
  original: version,
})

/** Posts, covers and editorial art come in density variants. */
export const responsiveImageSchema = z.object({
  xhdpi: version,
  hdpi: version,
  mdpi: version,
  ldpi: version,
  optimized: version,
  original: version,
})

export type ImageVersion = z.infer<typeof imageVersionSchema>
export type Avatar = z.infer<typeof avatarSchema>
export type ResponsiveImage = z.infer<typeof responsiveImageSchema>
