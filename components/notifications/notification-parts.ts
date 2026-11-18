import type { Author } from '@/types/user'
import type { Notification, NotificationKind } from '@/types/notification'
import type { Post, Region } from '@/types/post'

/** getActivityPath: where a notification leads (the post, else the user, else home). */
export const activityPath = (user: Author | null | undefined, post?: Post | null): string => {
  if (!user?.id) return '/'
  if (!post?.id) return `/${user.username}`
  return `/${user.username}/post/${post.token}`
}

/** What the original renders for a post summary: a text column plus image assets (regionItemsForNotifications). */
export type SummaryRegion = Region | { kind: 'rule' }

/** A post's summary, followed by a hidden rule and the comment when the notification is about one. */
export const summaryRegions = (post: Post, comment?: { content: Region[] } | null): SummaryRegion[] => {
  const regions: SummaryRegion[] = [...post.summary]
  if (comment) regions.push({ kind: 'rule' }, ...comment.content)
  return regions
}

/** Split a summary the way regionItemsForNotifications does: the first image, and the text column. */
export const splitSummary = (regions: SummaryRegion[]): { image: Region | null; texts: SummaryRegion[] } => ({
  image: regions.find((region): region is Region => region.kind === 'image') ?? null,
  texts: regions.filter((region) => region.kind === 'text' || region.kind === 'rule'),
})

/** Where a notification kind appears: the tab filters of the notifications view. */
export const kindTab: Record<NotificationKind, string> = {
  love_notification: 'loves',
  comment_notification: 'comments',
  comment_mention_notification: 'mentions',
  post_mention_notification: 'mentions',
  repost_notification: 'reposts',
  watch_notification: 'all',
  new_follower_post: 'relationships',
  new_followed_user_post: 'relationships',
}

/** The original's per-kind class on `.Notification` (e.g. `LoveNotification`). */
export const kindClass: Record<NotificationKind, string> = {
  love_notification: 'LoveNotification',
  comment_notification: 'CommentNotification',
  comment_mention_notification: 'CommentMentionNotification',
  post_mention_notification: 'PostMentionNotification',
  repost_notification: 'RepostNotification',
  watch_notification: 'WatchNotification',
  new_follower_post: 'NewFollowerPostNotification',
  new_followed_user_post: 'NewFollowedUserPostNotification',
}

/** The /notifications routes: `all` lives at the bare path. */
export const tabPath = (tab: string): string => (tab === 'all' ? '/notifications' : `/notifications/${tab}`)

export const notificationKey = (notification: Notification, index: number): string => `${notification.id}-${index}`
