import { ServerStream } from '@/components/streams/server-stream'

const ProfilePage = async ({ params }: { params: Promise<{ username: string }> }) => {
  const { username } = await params
  return <ServerStream spec={{ type: 'user', username: decodeURIComponent(username) }} emptyMessage="No posts yet." />
}

export default ProfilePage
