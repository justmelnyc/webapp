import type { Metadata } from 'next'
import { FollowingView } from '@/components/streams/following-view'
import { requireSession } from '@/lib/require-session'

export const metadata: Metadata = { title: 'Following' }

const FollowingTrendingPage = async () => {
  await requireSession('/following/trending')
  return <FollowingView kind="TRENDING" />
}

export default FollowingTrendingPage
