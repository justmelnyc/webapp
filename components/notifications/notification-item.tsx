import type { Notification as NotificationData } from '@/types/notification'
import { Frame } from './notification-frame'
import { PostTextLink, UserTextLink } from './notification-links'
import {
  CategoryPostNotification,
  CategoryUserNotification,
  SubmissionNotification,
  UserKindNotification,
} from './notification-misc-kinds'
import { CommentKindNotification, PostActionNotification } from './notification-post-kinds'
import { activityPath } from './notification-parts'

/** The original's NotificationContainer: picks the sentence for each kind of notification. */
export const NotificationItem = ({ data }: { data: NotificationData }) => {
  const { subject } = data
  switch (subject.__typename) {
    case 'Love':
    case 'Watch':
      return <PostActionNotification data={data} subject={subject} />
    case 'Comment':
      return <CommentKindNotification data={data} subject={subject} />
    case 'Post': {
      const isMention = data.kind === 'post_mention_notification'
      if (!isMention && data.kind !== 'repost_notification') return null
      return (
        <Frame data={data} notifier={subject.author} post={subject} path={activityPath(subject.author, subject)}>
          <UserTextLink user={subject.author} />
          {isMention ? ' mentioned you in a ' : ' reposted your '}
          <PostTextLink author={subject.author} post={subject} />.
        </Frame>
      )
    }
    case 'User':
      return <UserKindNotification data={data} subject={subject} />
    case 'ArtistInviteSubmission':
      return <SubmissionNotification data={data} subject={subject} />
    case 'CategoryPost':
      return <CategoryPostNotification data={data} subject={subject} />
    case 'CategoryUser':
      return <CategoryUserNotification data={data} subject={subject} />
  }
}
