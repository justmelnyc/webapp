import type { Post, Region } from '@/types/post'

/** The original treats a post as a repost when it carries the original's content (`selectPostIsRepost`). */
export const isRepost = (post: Post): boolean => (post.repostContent?.length ?? 0) > 0

/** Reposts keep the original author in `repostedSource`; `post.author` is the person who reposted. */
export const originalAuthorOf = (post: Post): Post['author'] => post.repostedSource?.author ?? post.author

/** What a repost of `post` shows: a repost shares the original's content, other posts their own. */
export const repostedRegions = (post: Post): Region[] => (isRepost(post) ? (post.repostContent ?? []) : post.content)

/** The id a repost of `post` points at: reposting a repost reposts the original. */
export const originalIdOf = (post: Post): string => post.repostedSource?.id ?? post.id
