import Link from 'next/link'
import { PostFollowButton } from '@/components/posts/post-follow-button'
import { timeAgoInWords } from '@/components/posts/time-ago-in-words'
import { Avatar } from '@/components/ui/avatar'
import type { Post } from '@/types/post'
import { avatarUrl } from '@/utils/images'
import './category-header.css'

interface CategoryHeaderProps {
  post: Post
  viewerId?: string | null
}

/** The category a post sits in: its first `categoryPost`, as the original's `links.categories.first()`. */
export const categoryOf = (post: Post): { name: string; slug: string } | null => {
  const category = post.categoryPosts?.[0]?.category
  return category ? { name: category.name, slug: category.slug } : null
}

/** The original's `CategoryHeader`: "@author in Category" on the global and subscribed feeds. */
export const CategoryHeader = ({ post, viewerId }: CategoryHeaderProps) => {
  const { author } = post
  const category = categoryOf(post)
  if (!category) return null
  return (
    <header className="CategoryHeader">
      <span className="author-with-relationship">
        <span className="container">
          <span className="CategoryHeaderAuthor">
            <Link className="PostHeaderLink" href={`/${author.username}`}>
              <Avatar src={avatarUrl(author.avatar, 'regular')} name={author.username} />
              <span className="DraggableUsername">@{author.username}</span>
            </Link>
          </span>
          <PostFollowButton
            userId={author.id}
            priority={viewerId === author.id ? 'self' : author.currentUserState?.relationshipPriority}
            signedIn={!!viewerId}
          />
        </span>
        <span className="CategoryHeaderCategory">
          <Link className="PostHeaderLink" href={`/discover/${category.slug}`}>
            <span>in </span>
            <span className="CategoryHeaderCategoryName">{category.name}</span>
          </Link>
        </span>
      </span>
      <span className="PostHeaderTools">
        <Link className="PostHeaderTimeAgoLink" href={`/${author.username}/post/${post.token}`}>
          <span>{timeAgoInWords(post.createdAt)}</span>
        </Link>
      </span>
    </header>
  )
}
