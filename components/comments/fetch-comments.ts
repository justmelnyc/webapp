import { commentPageSchema, type CommentPage } from '@/types/stream'

/** Browser-side fetch of one comment page via the /api/comments route handler. */
export const fetchCommentPage = async (postId: string, before: string | null): Promise<CommentPage> => {
  const params = new URLSearchParams({ postId })
  if (before) params.set('before', before)
  const response = await fetch(`/api/comments?${params}`)
  if (!response.ok) throw new Error('Could not load comments')
  return commentPageSchema.parse(await response.json())
}
