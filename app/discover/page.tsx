import type { Metadata } from 'next'
import { ServerStream } from '@/components/streams/server-stream'

export const metadata: Metadata = { title: 'Discover' }

const FeaturedPage = () => <ServerStream spec={{ type: 'global', kind: 'FEATURED' }} />

export default FeaturedPage
