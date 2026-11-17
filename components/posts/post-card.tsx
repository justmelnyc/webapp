import Link from 'next/link'
import type { ComponentProps } from 'react'
import { LoveButton } from '@/components/posts/love-button'
import { PostOwnerMenu } from '@/components/posts/post-owner-menu'
import { Avatar } from '@/components/ui/avatar'
import type { Post } from '@/types/post'
import { cn } from '@/utils/cn'
import { avatarUrl } from '@/utils/images'
import { timeAgo } from '@/utils/time'

const Root = ({ className, ...props }: ComponentProps<'article'>) => (
  <article className={cn('flex flex-col gap-3', className)} {...props} />
)

const Header = ({ post, viewerId }: { post: Post; viewerId?: string | null }) => {
  const { author } = post
  return (
    <header className="flex items-center gap-3">
      <Link href={`/${author.username}`}>
        <Avatar src={avatarUrl(author.avatar, 'regular')} name={author.username} size={40} />
      </Link>
      <Link href={`/${author.username}`} className="text-slate hover:text-ink text-sm">
        @{author.username}
      </Link>
      <Link href={`/${author.username}/post/${post.token}`} className="text-ash hover:text-ink ml-auto text-xs">
        {timeAgo(post.createdAt)}
      </Link>
      <PostOwnerMenu post={post} viewerId={viewerId} />
    </header>
  )
}

const Body = ({ className, ...props }: ComponentProps<'div'>) => <div className={cn('text-[15px]', className)} {...props} />

const Footer = ({ post, signedIn }: { post: Post; signedIn: boolean }) => (
  <footer className="text-ash flex items-center gap-5 text-sm">
    <span title="Views">👁 {post.postStats.viewsCount}</span>
    <Link href={`/${post.author.username}/post/${post.token}`} className="hover:text-ink">
      💬 {post.postStats.commentsCount}
    </Link>
    <LoveButton
      postId={post.id}
      loved={post.currentUserState.loved}
      count={post.postStats.lovesCount}
      signedIn={signedIn}
    />
  </footer>
)

/** <PostCard><PostCard.Header/><PostCard.Body/><PostCard.Footer/></PostCard> */
export const PostCard = Object.assign(Root, { Header, Body, Footer })
