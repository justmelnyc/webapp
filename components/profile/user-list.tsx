import Link from 'next/link'
import { Avatar } from '@/components/ui/avatar'
import { avatarUrl } from '@/utils/images'
import { htmlToText } from '@/utils/sanitize'
import type { Avatar as AvatarImages } from '@/types/image'

export interface UserListItem {
  id: string
  username: string
  name?: string | null
  avatar?: AvatarImages | null
  bio?: string | null
}

interface UserListProps {
  users: UserListItem[]
  emptyMessage: string
}

export const UserList = ({ users, emptyMessage }: UserListProps) => {
  if (users.length === 0) return <p className="text-ash py-8 text-center">{emptyMessage}</p>
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {users.map((user) => {
        const name = user.name || user.username
        const bio = user.bio ? htmlToText(user.bio) : ''
        return (
          <li key={user.id}>
            <Link
              href={`/${encodeURIComponent(user.username)}`}
              className="border-stone hover:border-ink flex items-start gap-3 rounded-sm border p-3"
            >
              <Avatar src={avatarUrl(user.avatar)} name={name} size={48} />
              <span className="min-w-0">
                <span className="block truncate font-medium">{name}</span>
                <span className="text-ash block truncate text-sm">@{user.username}</span>
                {bio && <span className="text-slate mt-1 line-clamp-2 block text-sm">{bio}</span>}
              </span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
