import Link from 'next/link'
import { logout } from '@/actions/auth'
import { Avatar } from '@/components/ui/avatar'
import { TextButton } from '@/components/ui/button'
import type { Viewer } from '@/types/user'
import { avatarUrl } from '@/utils/images'

export const UserMenu = ({ viewer }: { viewer: Viewer }) => (
  <div className="flex items-center gap-4">
    <Link href="/settings" className="text-ash hover:text-ink text-sm">
      Settings
    </Link>
    <form action={logout}>
      <TextButton type="submit">Log out</TextButton>
    </form>
    <Link href={`/${viewer.username}`} aria-label="Your profile">
      <Avatar src={avatarUrl(viewer.avatar, 'regular')} name={viewer.username} size={36} />
    </Link>
  </div>
)
