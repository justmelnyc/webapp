import Link from 'next/link'
import type { Notification as NotificationData } from '@/types/notification'
import { Emoji } from '@/components/ui/emoji'
import { Frame } from './notification-frame'
import { PostTextLink, UserTextLink } from './notification-links'
import { Notification } from './notification'
import { activityPath, kindClass } from './notification-parts'

type Subject = NotificationData['subject']
type SubmissionSubject = Extract<Subject, { __typename: 'ArtistInviteSubmission' }>
type CategoryPostSubject = Extract<Subject, { __typename: 'CategoryPost' }>
type CategoryUserSubject = Extract<Subject, { __typename: 'CategoryUser' }>
type UserSubject = Extract<Subject, { __typename: 'User' }>

interface KindProps<S> {
  data: NotificationData
  subject: S
}

/** Followers, accepted invitations and the welcome line: notifications about a user. */
export const UserKindNotification = ({ data, subject }: KindProps<UserSubject>) => {
  const path = activityPath(subject)
  switch (data.kind) {
    case 'new_follower_post':
      return (
        <Frame data={data} notifier={subject} path={path}>
          <UserTextLink user={subject} />
          {' started following you.'}
        </Frame>
      )
    case 'new_followed_user_post':
      return (
        <Frame data={data} notifier={subject} path={path}>
          {'You started following '}
          <UserTextLink user={subject} />.
        </Frame>
      )
    case 'invitation_accepted_post':
      return (
        <Frame data={data} notifier={subject} path={path}>
          <UserTextLink user={subject} />
          {' accepted your invitation.'}
        </Frame>
      )
    case 'welcome_notification':
      return <p>Welcome to Ello!</p>
    default:
      return null
  }
}

const InviteLink = ({ title, slug }: { title: string; slug: string }) => <Link href={`/invites/${slug}`}>{title}</Link>

/** An artist invite submission was accepted: yours, or one from someone you follow. */
export const SubmissionNotification = ({ data, subject }: KindProps<SubmissionSubject>) => {
  const { artistInvite: invite, post } = subject
  if (data.kind === 'approved_artist_invite_submission') {
    return (
      <Notification className={kindClass[data.kind]}>
        <Notification.Body
          extra={
            <p>
              Your submission to the {invite.title} Invite has been accepted
              <Emoji name="v" title="Yay!" />
            </p>
          }
        >
          <p>Invite Submission Accepted</p>
        </Notification.Body>
        <Notification.Footer href={`/invites/${invite.slug}`} createdAt={data.createdAt} />
      </Notification>
    )
  }
  if (!post) return null
  return (
    <Frame data={data} notifier={post.author} post={post} path={activityPath(post.author, post)}>
      <UserTextLink user={post.author} />
      {"'s submission to "}
      <InviteLink title={invite.title} slug={invite.slug} />
      {' was accepted'}
    </Frame>
  )
}

/** A category's editors featured a post (or a repost, or a repost of your post). */
export const CategoryPostNotification = ({ data, subject }: KindProps<CategoryPostSubject>) => {
  const { post, category, featuredBy } = subject
  const categoryLink = <Link href={`/discover/${category.slug}`}>{category.name}</Link>
  const postLink = (text?: string) => <PostTextLink author={post.author} post={post} text={text} />
  return (
    <Frame data={data} notifier={featuredBy} post={post} path={activityPath(post.author, post)}>
      <UserTextLink user={featuredBy} />
      {data.kind === 'category_post_via_repost_featured' ? ' featured a ' : ' featured your '}
      {data.kind === 'category_post_featured' ? postLink() : postLink('repost')}
      {data.kind === 'category_post_via_repost_featured' ? ' of your post in ' : ' in '}
      {categoryLink}
    </Frame>
  )
}

/** Added to a category as featured, curator or moderator. */
export const CategoryUserNotification = ({ data, subject }: KindProps<CategoryUserSubject>) => {
  const { category, featuredBy } = subject
  const categoryLink = <Link href={`/discover/${category.slug}`}>{category.name}</Link>
  const path = `/discover/${category.slug}`
  switch (data.kind) {
    case 'user_added_as_featured_notification':
      return (
        <Frame data={data} path={path}>
          <UserTextLink user={featuredBy} />
          {' has featured you in '}
          {categoryLink}
          {'. '}
          <Link href="https://ello.co/wtf/support/featured-members/">Learn more here.</Link>
        </Frame>
      )
    case 'user_added_as_curator_notification':
      return (
        <Frame data={data} path={path}>
          <UserTextLink user={featuredBy} />
          {' has invited you to help curate '}
          {categoryLink}.
        </Frame>
      )
    case 'user_added_as_moderator_notification':
      return (
        <Frame data={data} path={path}>
          <UserTextLink user={featuredBy} />
          {' has invited you to help moderate '}
          {categoryLink}.
        </Frame>
      )
    default:
      return null
  }
}
