import { Suspense, type ReactNode } from 'react'
import { PostStream } from '@/components/streams/post-stream'
import { StreamBusy } from '@/components/streams/stream-busy'
import { getSession } from '@/lib/session'
import { fetchStream } from '@/services/streams'
import type { StreamSpec } from '@/types/stream'

interface ServerStreamProps {
  spec: StreamSpec
  emptyMessage?: ReactNode
}

/** Loads the first page on the server, then hands over to the client for infinite scroll. */
const LoadedStream = async ({ spec, emptyMessage }: ServerStreamProps) => {
  const [initialPage, session] = await Promise.all([fetchStream(spec), getSession()])
  return (
    <PostStream
      spec={spec}
      initialPage={initialPage}
      signedIn={!!session}
      viewerId={session?.id ?? null}
      emptyMessage={emptyMessage}
    />
  )
}

/**
 * The page around a stream is sent first, with the spinner where the posts go, and the posts follow once they
 * arrive: the order the original drew them in (its server rendered the page, the stream loaded in the browser).
 */
export const ServerStream = (props: ServerStreamProps) => (
  <Suspense fallback={<StreamBusy />}>
    <LoadedStream {...props} />
  </Suspense>
)
