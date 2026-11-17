import type { Metadata } from 'next'
import { ServerStream } from '@/components/streams/server-stream'

export const metadata: Metadata = { title: 'Trending' }

const TrendingPage = () => <ServerStream spec={{ type: 'global', kind: 'TRENDING' }} />

export default TrendingPage
