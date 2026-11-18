import { z } from 'zod'
import { commentSchema, pageInfoSchema, postSchema } from './post'
import { authorSchema } from './user'

/** The tabs of the notifications view (`NotificationCategory`). */
export const notificationTabs = ['all', 'comments', 'mentions', 'loves', 'reposts', 'relationships'] as const
export const notificationTabSchema = z.enum(notificationTabs)
export type NotificationTab = z.infer<typeof notificationTabSchema>

const loveSubject = z.object({ __typename: z.enum(['Love', 'Watch']), id: z.string(), post: postSchema, user: authorSchema })
const commentSubject = commentSchema.extend({ __typename: z.literal('Comment'), parentPost: postSchema })
const postSubject = postSchema.extend({ __typename: z.literal('Post') })
const userSubject = authorSchema.extend({ __typename: z.literal('User') })

const subjectSchema = z.discriminatedUnion('__typename', [loveSubject, commentSubject, postSubject, userSubject])

/** Kinds the app can render; anything else the API sends is dropped at the boundary. */
export const notificationKinds = [
  'love_notification',
  'comment_notification',
  'comment_mention_notification',
  'post_mention_notification',
  'repost_notification',
  'watch_notification',
  'new_follower_post',
  'new_followed_user_post',
] as const
export const notificationKindSchema = z.enum(notificationKinds)
export type NotificationKind = z.infer<typeof notificationKindSchema>

const rawNotification = z.object({
  id: z.string(),
  kind: z.string(),
  createdAt: z.string(),
  subject: z.unknown(),
})

export const notificationSchema = z.object({
  id: z.string(),
  kind: notificationKindSchema,
  createdAt: z.string(),
  subject: subjectSchema,
})
export type Notification = z.infer<typeof notificationSchema>

/** Parse a page leniently: unknown kinds and malformed items are skipped, not fatal. */
export const notificationPageSchema = pageInfoSchema.extend({
  notifications: z.array(rawNotification).transform((items): Notification[] =>
    items.flatMap((item) => {
      const parsed = notificationSchema.safeParse(item)
      return parsed.success ? [parsed.data] : []
    }),
  ),
})
export type NotificationPage = z.infer<typeof notificationPageSchema>

export const isNotificationTab = (value: string | undefined): value is NotificationTab =>
  notificationTabs.some((tab) => tab === value)
