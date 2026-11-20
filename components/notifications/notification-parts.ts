import type { Author } from '@/types/user'
import type { Notification, NotificationKind } from '@/types/notification'
import type { Post, Region } from '@/types/post'

/** Just enough of a post to link to it. */
export type PostRef = Pick<Post, 'id' | 'token'>

/** getActivityPath: where a notification leads (the post, else the user, else home). */
export const activityPath = (user: Author | null | undefined, post?: PostRef | null): string => {
  if (!user?.id) return '/'
  if (!post?.id) return `/${user.username}`
  return `/${user.username}/post/${post.token}`
}

/** What the original renders for a post summary: a text column plus image assets (regionItemsForNotifications). */
export type SummaryRegion = Region | { kind: 'rule' }

/** A post's summary, followed by a hidden rule and the comment when the notification is about one. */
export const summaryRegions = (post: { summary: Region[] }, comment?: { content: Region[] } | null): SummaryRegion[] => {
  const regions: SummaryRegion[] = [...post.summary]
  if (comment) regions.push({ kind: 'rule' }, ...comment.content)
  return regions
}

/**
 * Split a summary the way regionItemsForNotifications does: the first image or embed (the original
 * collects both as "image assets" and shows the first), and the text column.
 */
export const splitSummary = (regions: SummaryRegion[]): { image: Region | null; texts: SummaryRegion[] } => ({
  image: regions.find((region): region is Region => region.kind === 'image' || region.kind === 'embed') ?? null,
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
  invitation_accepted_post: 'relationships',
  comment_on_original_post_notification: 'comments',
  comment_on_repost_notification: 'comments',
  love_on_original_post_notification: 'loves',
  love_on_repost_notification: 'loves',
  watch_comment_notification: 'all',
  watch_on_original_post_notification: 'all',
  watch_on_repost_notification: 'all',
  approved_artist_invite_submission: 'all',
  approved_artist_invite_submission_notification_for_followers: 'all',
  category_post_featured: 'all',
  category_repost_featured: 'all',
  category_post_via_repost_featured: 'all',
  user_added_as_featured_notification: 'all',
  user_added_as_curator_notification: 'all',
  user_added_as_moderator_notification: 'all',
  welcome_notification: 'all',
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
  invitation_accepted_post: 'InvitationAcceptedNotification',
  // the original gives "on original" comments the class of a plain comment on a post
  comment_on_original_post_notification: 'CommentOnPostNotification',
  comment_on_repost_notification: 'CommentOnRepostNotification',
  love_on_original_post_notification: 'LoveOnOriginalPostNotification',
  love_on_repost_notification: 'LoveOnRepostNotification',
  watch_comment_notification: 'WatchCommentNotification',
  watch_on_original_post_notification: 'WatchOnOriginalPostNotification',
  watch_on_repost_notification: 'WatchOnRepostNotification',
  // sic: the original spells it "Arist"
  approved_artist_invite_submission: 'ApprovedAristInviteSubmissionNotification',
  approved_artist_invite_submission_notification_for_followers: 'ApprovedArtistInviteSubmissionFromFollowingNotification',
  category_post_featured: 'FeaturedCategoryPostNotification',
  category_repost_featured: 'FeaturedCategoryRepostNotification',
  category_post_via_repost_featured: 'FeaturedCategoryPostViaRepostNotification',
  user_added_as_featured_notification: 'UserAddedAsFeaturedNotification',
  user_added_as_curator_notification: 'UserAddedAsCuratorNotification',
  user_added_as_moderator_notification: 'UserAddedAsModeratorNotification',
  welcome_notification: '',
}

/** The /notifications routes: `all` lives at the bare path. */
export const tabPath = (tab: string): string => (tab === 'all' ? '/notifications' : `/notifications/${tab}`)

export const notificationKey = (notification: Notification, index: number): string => `${notification.id}-${index}`
