import { sanitizeComment, sanitizePost } from '@/services/sanitize'
import type { Notification } from '@/types/notification'

/** Clean the user-authored HTML of whatever a notification points at. */
export const sanitizeNotification = (notification: Notification): Notification => {
  const { subject } = notification
  switch (subject.__typename) {
    case 'Post':
      return { ...notification, subject: { ...subject, ...sanitizePost(subject) } }
    case 'Comment':
      return { ...notification, subject: { ...subject, ...sanitizeComment(subject), parentPost: sanitizePost(subject.parentPost) } }
    case 'Love':
    case 'Watch':
      return { ...notification, subject: { ...subject, post: sanitizePost(subject.post) } }
    case 'ArtistInviteSubmission':
      return { ...notification, subject: { ...subject, post: subject.post ? sanitizePost(subject.post) : subject.post } }
    case 'CategoryPost':
      return { ...notification, subject: { ...subject, post: sanitizePost(subject.post) } }
    case 'User':
    case 'CategoryUser':
      return notification
  }
}
