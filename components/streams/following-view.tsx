import { FollowingBeacon } from '@/components/streams/following-beacon'
import { ServerStream } from '@/components/streams/server-stream'
import type { StreamKind } from '@/types/stream'

interface FollowingViewProps {
  kind: Extract<StreamKind, 'RECENT' | 'TRENDING'>
}

/** Original `Following` view: /following is the recent feed, /following/trending the trending one. */
export const FollowingView = ({ kind }: FollowingViewProps) => (
  <div className="Following">
    <FollowingBeacon />
    <ServerStream
      spec={{ type: 'following', kind }}
      emptyMessage="Follow creators and communities to fill your feed."
    />
  </div>
)
