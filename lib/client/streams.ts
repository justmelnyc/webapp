import { postPageSchema, type PostPage, type StreamSpec } from '@/types/stream'

/** Browser-side fetch of one stream page via the /api/streams route handler. */
export const fetchStreamPage = async (spec: StreamSpec, before: string | null): Promise<PostPage> => {
  const params = new URLSearchParams({ spec: JSON.stringify(spec) })
  if (before) params.set('before', before)
  const response = await fetch(`/api/streams?${params}`)
  if (!response.ok) throw new Error('Could not load more posts')
  return postPageSchema.parse(await response.json())
}
