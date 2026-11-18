import type { Notification as NotificationData } from '@/types/notification'
import type { Author } from '@/types/user'
import { Frame, sourceSummary } from './notification-frame'
import { PostTextLink, UserTextLink } from './notification-links'
import { activityPath } from './notification-parts'

type Subject = NotificationData['subject']
type LoveSubject = Extract<Subject, { __typename: 'Love' | 'Watch' }>
type CommentSubject = Extract<Subject, { __typename: 'Comment' }>

interface PostActionProps {
  data: NotificationData
  subject: LoveSubject
}

/** Loves and watches, plain or on a repost ("your repost", "'s repost of your post"). */
export const PostActionNotification = ({ data, subject }: PostActionProps) => {
  const { post, user } = subject
  const verb = data.kind.startsWith('watch') ? ' is watching ' : ' loved '
  const path = activityPath(post.author, post)
  switch (data.kind) {
    case 'love_notification':
    case 'watch_notification':
      return (
        <Frame data={data} notifier={user} post={post} path={path}>
          <UserTextLink user={user} />
          {data.kind === 'watch_notification' ? ' is watching your ' : ' loved your '}
          <PostTextLink author={post.author} post={post} />.
        </Frame>
      )
    case 'love_on_repost_notification':
    case 'watch_on_repost_notification':
      return (
        <Frame data={data} notifier={user} post={post} path={path}>
          <UserTextLink user={user} />
          {data.kind === 'watch_on_repost_notification' ? ' is watching your ' : ' loved your '}
          <PostTextLink author={post.author} post={post} text="repost" />.
        </Frame>
      )
    case 'love_on_original_post_notification':
    case 'watch_on_original_post_notification': {
      const source = post.repostedSource
      if (!source) return null
      return (
        <Frame data={data} notifier={user} post={post} path={path}>
          <UserTextLink user={user} />
          {verb}
          <UserTextLink user={post.author} />
          {"'s "}
          <PostTextLink author={post.author} post={post} text="repost" />
          {' of your '}
          <PostTextLink author={source.author} post={source} />.
        </Frame>
      )
    }
    default:
      return null
  }
}

interface CommentKindProps {
  data: NotificationData
  subject: CommentSubject
}

const CommentActor = ({ author }: { author: Author }) => <UserTextLink user={author} />

/** Comments: on your post, mentions, on your repost, on a repost of your post, on a post you watch. */
export const CommentKindNotification = ({ data, subject }: CommentKindProps) => {
  const { parentPost: post } = subject
  const path = activityPath(post.author, post)
  const props = { data, notifier: subject.author, comment: subject, path }
  switch (data.kind) {
    case 'comment_notification':
    case 'comment_mention_notification': {
      const isMention = data.kind === 'comment_mention_notification'
      return (
        <Frame {...props} post={post}>
          <CommentActor author={subject.author} />
          {isMention ? ' mentioned you in a ' : ' commented on your '}
          <PostTextLink author={post.author} post={post} text={isMention ? 'comment' : 'post'} />.
        </Frame>
      )
    }
    case 'comment_on_repost_notification':
      return (
        <Frame {...props} post={post}>
          <CommentActor author={subject.author} />
          {' commented on your '}
          <PostTextLink author={post.author} post={post} text="repost" />.
        </Frame>
      )
    case 'comment_on_original_post_notification': {
      const source = post.repostedSource
      if (!source) return null
      return (
        <Frame {...props} post={sourceSummary(source)}>
          <CommentActor author={subject.author} />
          {' commented on '}
          <UserTextLink user={post.author} />
          {"'s "}
          <PostTextLink author={post.author} post={post} text="repost" />
          {' of your '}
          <PostTextLink author={source.author} post={source} />.
        </Frame>
      )
    }
    case 'watch_comment_notification':
      return (
        <Frame {...props} post={post}>
          <CommentActor author={subject.author} />
          {' commented on a '}
          <PostTextLink author={post.author} post={post} />
          {" you're watching."}
        </Frame>
      )
    default:
      return null
  }
}
