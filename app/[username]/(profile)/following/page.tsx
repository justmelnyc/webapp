import { getFollowCards } from '@/components/profile/user-card-data'
import { UserGrid } from '@/components/profile/user-grid'
import { getSession } from '@/lib/session'

const FollowingPage = async ({ params }: { params: Promise<{ username: string }> }) => {
  const { username } = await params
  const [users, session] = await Promise.all([getFollowCards(decodeURIComponent(username), 'following'), getSession()])
  return <UserGrid users={users} signedIn={!!session} />
}

export default FollowingPage
