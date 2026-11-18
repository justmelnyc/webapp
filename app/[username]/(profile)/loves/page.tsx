import { ServerStream } from '@/components/streams/server-stream'

const LovesPage = async ({ params }: { params: Promise<{ username: string }> }) => {
  const { username } = await params
  return <ServerStream spec={{ type: 'loves', username: decodeURIComponent(username) }} emptyMessage="No loves yet." />
}

export default LovesPage
