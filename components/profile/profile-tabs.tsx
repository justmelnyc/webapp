import { NavLink } from '@/components/layout/nav-link'

export const ProfileTabs = ({ username }: { username: string }) => {
  const base = `/${encodeURIComponent(username)}`
  return (
    <nav aria-label="Profile" className="border-stone flex gap-6 border-b pb-2">
      <NavLink href={base}>Posts</NavLink>
      <NavLink href={`${base}/following`}>Following</NavLink>
      <NavLink href={`${base}/followers`}>Followers</NavLink>
      <NavLink href={`${base}/loves`}>Loves</NavLink>
    </nav>
  )
}
