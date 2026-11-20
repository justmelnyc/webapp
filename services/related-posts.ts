import 'server-only'
import { z } from 'zod'
import { graphql, rest } from '@/lib/api/client'
import { FIND_POSTS } from '@/constants/artist-invite-queries'
import { RELATED_POSTS_MAX } from '@/constants/related-posts'
import { isApiError } from '@/lib/errors'
import { sanitizePost } from '@/services/sanitize'
import { postSchema, type Post } from '@/types/post'

/** The v2 answer carries whole posts in the old flat shape; only their tokens are read from it. */
const relatedEnvelope = z.object({ posts: z.array(z.object({ token: z.string() })).nullish() })
const postsEnvelope = z.object({ findPosts: z.array(postSchema) })

/**
 * The posts shown under a post on its page, in the API's order (the original's `loadRelatedPosts`:
 * `GET /api/v2/posts/~token/related?per_page=`). The posts themselves come from `findPosts`. They
 * are an extra: when the API fails the page does without them.
 */
export const getRelatedPosts = async (token: string, perPage: number = RELATED_POSTS_MAX): Promise<Post[]> => {
  try {
    const path = `/api/v2/posts/~${encodeURIComponent(token)}/related?per_page=${perPage}`
    const tokens = ((await rest(path, relatedEnvelope)).posts ?? []).map((post) => post.token)
    if (tokens.length === 0) return []
    const { findPosts } = await graphql(FIND_POSTS, { tokens }, postsEnvelope)
    const byToken = new Map(findPosts.map((post) => [post.token, post]))
    return tokens.flatMap((related) => {
      const post = byToken.get(related)
      return post ? [sanitizePost(post)] : []
    })
  } catch (error) {
    if (isApiError(error)) return []
    throw error
  }
}
