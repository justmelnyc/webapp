import type { ReactNode } from 'react'
import type { Notification as NotificationData } from '@/types/notification'
import type { Post } from '@/types/post'
import type { Author } from '@/types/user'
import { cn } from '@/utils/cn'
import { Notification } from './notification'
import { PostTextLink, UserTextLink } from './notification-links'
import { activityPath, kindClass, splitSummary, summaryRegions } from './notification-parts'

interface FrameProps {
  data: NotificationData
  /** Who the avatar shows; none for kinds that are not about a person. */
  notifier?: Author | null
  /** The post whose thumbnail and text accompany the sentence. */
  post?: Post | null
  /** A comment whose text follows the post's. */
  comment?: { content: Post['content'] } | null
  path: string
  children: ReactNode
}

/** One notification: avatar, thumbnail, sentence, text summary and age. */
const Frame = ({ data, notifier, post, comment, path, children }: FrameProps) => {
  const { image, texts } = post ? splitSummary(summaryRegions(post, comment)) : { image: null, texts: [] }
  return (
    <Notification className={cn(kindClass[data.kind])} hasAsset={!!image}>
      {notifier ? <Notification.Header notifier={notifier} /> : null}
      {image && post ? <Notification.Asset region={image} assets={post.assets} href={path} /> : null}
      <Notification.Body texts={texts}>
        <p>{children}</p>
      </Notification.Body>
      <Notification.Footer href={path} createdAt={data.createdAt} />
    </Notification>
  )
}

/** The original's NotificationContainer: picks the sentence for each kind of notification. */
export const NotificationItem = ({ data }: { data: NotificationData }) => {
  const { subject } = data
  switch (data.kind) {
    case 'love_notification':
    case 'watch_notification': {
      if (subject.__typename !== 'Love' && subject.__typename !== 'Watch') return null
      const { post, user } = subject
      const isLove = data.kind === 'love_notification'
      return (
        <Frame data={data} notifier={user} post={post} path={activityPath(post.author, post)}>
          <UserTextLink user={user} />
          {isLove ? ' loved your ' : ' is watching your '}
          <PostTextLink author={post.author} post={post} />.
        </Frame>
      )
    }
    case 'comment_notification':
    case 'comment_mention_notification': {
      if (subject.__typename !== 'Comment') return null
      const { parentPost: post } = subject
      const isMention = data.kind === 'comment_mention_notification'
      return (
        <Frame data={data} notifier={subject.author} post={post} comment={subject} path={activityPath(post.author, post)}>
          <UserTextLink user={subject.author} />
          {isMention ? ' mentioned you in a ' : ' commented on your '}
          <PostTextLink author={post.author} post={post} text={isMention ? 'comment' : 'post'} />.
        </Frame>
      )
    }
    case 'post_mention_notification':
    case 'repost_notification': {
      if (subject.__typename !== 'Post') return null
      const isMention = data.kind === 'post_mention_notification'
      return (
        <Frame data={data} notifier={subject.author} post={subject} path={activityPath(subject.author, subject)}>
          <UserTextLink user={subject.author} />
          {isMention ? ' mentioned you in a ' : ' reposted your '}
          <PostTextLink author={subject.author} post={subject} />.
        </Frame>
      )
    }
    case 'new_follower_post':
    case 'new_followed_user_post': {
      if (subject.__typename !== 'User') return null
      const isFollower = data.kind === 'new_follower_post'
      return (
        <Frame data={data} notifier={subject} path={activityPath(subject)}>
          {isFollower ? null : 'You started following '}
          <UserTextLink user={subject} />
          {isFollower ? ' started following you.' : '.'}
        </Frame>
      )
    }
  }
}
