import type { Metadata } from 'next'
import { ServerStream } from '@/components/streams/server-stream'

export const metadata: Metadata = { title: 'Recent' }

const RecentPage = () => <ServerStream spec={{ type: 'global', kind: 'RECENT' }} />

export default RecentPage
