import { UserList } from '@/components/profile/user-list'
import { getUserList } from '@/services/users'

const FollowingPage = async ({ params }: { params: Promise<{ username: string }> }) => {
  const { username } = await params
  const users = await getUserList(decodeURIComponent(username), 'following')
  const items = users.map(({ shortBio, formattedShortBio, ...user }) => ({ ...user, bio: formattedShortBio ?? shortBio }))
  return <UserList users={items} emptyMessage="Not following anyone yet." />
}

export default FollowingPage
