import type { Metadata } from 'next'
import { FollowingView } from '@/components/streams/following-view'
import { requireSession } from '@/lib/require-session'

export const metadata: Metadata = { title: 'Following' }

const FollowingPage = async () => {
  await requireSession('/following')
  return <FollowingView kind="RECENT" />
}

export default FollowingPage
