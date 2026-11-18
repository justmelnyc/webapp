import 'server-only'
import { cleanHtml } from '@/utils/sanitize'
import type { Comment, Post, Region } from '@/types/post'

const cleanRegion = (region: Region): Region =>
  region.kind === 'text' ? { ...region, data: cleanHtml(region.data) } : region

/** Clean user-authored HTML once, at the data boundary, so components can render it as-is. */
export const sanitizePost = (post: Post): Post => ({
  ...post,
  summary: post.summary.map(cleanRegion),
  content: post.content.map(cleanRegion),
  repostContent: post.repostContent?.map(cleanRegion),
})

export const sanitizeComment = (comment: Comment): Comment => ({
  ...comment,
  content: comment.content.map(cleanRegion),
})
