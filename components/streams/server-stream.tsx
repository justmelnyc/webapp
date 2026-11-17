import { PostStream } from '@/components/streams/post-stream'
import { getSession } from '@/lib/session'
import { fetchStream } from '@/services/streams'
import type { StreamSpec } from '@/types/stream'

interface ServerStreamProps {
  spec: StreamSpec
  emptyMessage?: string
}

/** Loads the first page on the server, then hands over to the client for infinite scroll. */
export const ServerStream = async ({ spec, emptyMessage }: ServerStreamProps) => {
  const [initialPage, session] = await Promise.all([fetchStream(spec), getSession()])
  return <PostStream spec={spec} initialPage={initialPage} signedIn={!!session} emptyMessage={emptyMessage} />
}
