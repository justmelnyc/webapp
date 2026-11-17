import { UserList } from '@/components/profile/user-list'
import { getUserList } from '@/services/users'

const FollowersPage = async ({ params }: { params: Promise<{ username: string }> }) => {
  const { username } = await params
  const users = await getUserList(decodeURIComponent(username), 'followers')
  const items = users.map(({ shortBio, formattedShortBio, ...user }) => ({ ...user, bio: formattedShortBio ?? shortBio }))
  return <UserList users={items} emptyMessage="No followers yet." />
}

export default FollowersPage
