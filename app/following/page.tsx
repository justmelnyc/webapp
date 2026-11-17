import type { Metadata } from 'next'
import { FollowingBeacon } from '@/components/streams/following-beacon'
import { ServerStream } from '@/components/streams/server-stream'
import { requireSession } from '@/lib/require-session'

export const metadata: Metadata = { title: 'Following' }

const FollowingPage = async () => {
  await requireSession('/following')
  return (
    <div className="Following">
      <FollowingBeacon />
      <ServerStream
        spec={{ type: 'following' }}
        emptyMessage="Follow creators and communities to fill your feed."
      />
    </div>
  )
}

export default FollowingPage
