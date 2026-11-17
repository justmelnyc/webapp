import 'server-only'
import { z } from 'zod'
import { graphql } from '@/lib/api/client'
import {
  CATEGORY_STREAM,
  FOLLOWING_STREAM,
  GLOBAL_STREAM,
  USER_LOVES,
  USER_STREAM,
} from '@/constants/queries'
import { pageInfoSchema, postSchema } from '@/types/post'
import { sanitizePost } from '@/services/sanitize'
import { postPageSchema, type PostPage, type StreamSpec } from '@/types/stream'

const wrap = <K extends string>(key: K) => z.object({ [key]: postPageSchema } as Record<K, typeof postPageSchema>)

const lovesSchema = z.object({
  userLoveStream: pageInfoSchema.extend({ loves: z.array(z.object({ post: postSchema })) }),
})

const userArg = (username: string): string => `~${username.replace(/^~/, '')}`

/** Load one page of any feed. `before` is the cursor returned as `next` by the previous page. */
const clean = (page: PostPage): PostPage => ({ ...page, posts: page.posts.map(sanitizePost) })

export const fetchStream = async (spec: StreamSpec, before?: string | null): Promise<PostPage> =>
  clean(await loadStream(spec, before))

const loadStream = async (spec: StreamSpec, before?: string | null): Promise<PostPage> => {
  const cursor = before ?? undefined
  switch (spec.type) {
    case 'global': {
      const data = await graphql(GLOBAL_STREAM, { kind: spec.kind, before: cursor }, wrap('globalPostStream'))
      return data.globalPostStream
    }
    case 'following': {
      const data = await graphql(FOLLOWING_STREAM, { kind: 'RECENT', before: cursor }, wrap('followingPostStream'))
      return data.followingPostStream
    }
    case 'category': {
      const vars = { slug: spec.slug, kind: spec.kind, before: cursor }
      const data = await graphql(CATEGORY_STREAM, vars, wrap('categoryPostStream'))
      return data.categoryPostStream
    }
    case 'user': {
      const data = await graphql(USER_STREAM, { username: userArg(spec.username), before: cursor }, wrap('userPostStream'))
      return data.userPostStream
    }
    case 'loves': {
      const data = await graphql(USER_LOVES, { username: userArg(spec.username), before: cursor }, lovesSchema)
      const { loves, ...page } = data.userLoveStream
      return { ...page, posts: loves.map((love) => love.post) }
    }
  }
}
