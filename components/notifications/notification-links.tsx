import Link from 'next/link'
import type { Post } from '@/types/post'
import type { Author } from '@/types/user'
import { activityPath } from './notification-parts'

/** `@username`, linking to the profile. */
export const UserTextLink = ({ user }: { user: Author | null | undefined }) => {
  if (!user?.id) return null
  return <Link href={activityPath(user)}>@{user.username}</Link>
}

/** A word that links to the post (`post`, `comment`, `repost`), or plain text without one. */
export const PostTextLink = ({ author, post, text = 'post' }: { author?: Author | null; post?: Post | null; text?: string }) => {
  if (!post?.id || !author) return <span>{text}</span>
  return <Link href={activityPath(author, post)}>{text}</Link>
}
