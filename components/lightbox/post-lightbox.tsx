'use client'

import { useMemo, type ReactNode } from 'react'
import type { Comment, Post } from '@/types/post'
import { LightboxPostTools, type LightboxToolsVariant } from './lightbox-post-tools'
import { LightboxProvider } from './lightbox-provider'
import { commentLightboxItem, postLightboxItem } from './lightbox-queue'
import { CommentQueue, PostQueue } from './lightbox-queue-view'

interface PostsLightboxProps {
  posts: Post[]
  viewerId: string | null
  /** A grid stream; the original then takes longer to show the queue. */
  isGridMode?: boolean
  /** `related` for the related posts under a post: their comment and repost tools go to the post's page. */
  tools?: LightboxToolsVariant
  children: ReactNode
}

/** The lightbox of a stream of posts (or of the one post on a post page): the queue runs through all their pictures. */
export const PostsLightbox = ({ posts, viewerId, isGridMode, tools = 'stream', children }: PostsLightboxProps) => {
  const items = useMemo(() => posts.map(postLightboxItem), [posts])
  return (
    <LightboxProvider
      items={items}
      Queue={PostQueue}
      isGridMode={isGridMode}
      isRelatedStream={tools === 'related'}
      renderTools={(postId, close) => {
        const post = posts.find((candidate) => candidate.id === postId)
        return post ? <LightboxPostTools post={post} viewerId={viewerId} onClose={close} variant={tools} /> : null
      }}
    >
      {children}
    </LightboxProvider>
  )
}

interface CommentsLightboxProps {
  comments: Comment[]
  /** The post the comments belong to: the lightbox shows its tools (the original's `parentPostId`). */
  post: Post
  viewerId: string | null
  children: ReactNode
}

/** The lightbox of a post's comment list: the queue runs through the pictures in the comments. */
export const CommentsLightbox = ({ comments, post, viewerId, children }: CommentsLightboxProps) => {
  const items = useMemo(() => comments.map(commentLightboxItem), [comments])
  return (
    <LightboxProvider
      items={items}
      Queue={CommentQueue}
      isCommentStream
      renderTools={(_, close) => <LightboxPostTools post={post} viewerId={viewerId} onClose={close} />}
    >
      {children}
    </LightboxProvider>
  )
}
