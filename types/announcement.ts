import { z } from 'zod'
import { responsiveImageSchema } from './image'

/** `GET /api/v2/most_recent_announcements`: the banner above the notifications. */
export const announcementSchema = z.object({
  id: z.string(),
  header: z.string().nullish(),
  body: z.string().nullish(),
  ctaCaption: z.string().nullish(),
  ctaHref: z.string().nullish(),
  isStaffPreview: z.boolean().nullish(),
  image: responsiveImageSchema.nullish(),
})
export type Announcement = z.infer<typeof announcementSchema>

export const announcementEnvelopeSchema = z.object({ announcements: announcementSchema })
