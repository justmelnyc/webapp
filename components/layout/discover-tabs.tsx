import { NavLink } from '@/components/layout/nav-link'
import { getCategories } from '@/services/content'

const KINDS = [
  { href: '/discover', label: 'Featured' },
  { href: '/discover/trending', label: 'Trending' },
  { href: '/discover/recent', label: 'Recent' },
] as const

export const DiscoverTabs = async () => {
  const categories = await getCategories()
  return (
    <nav aria-label="Discover" className="flex flex-wrap items-center gap-x-6 gap-y-2">
      {KINDS.map((tab) => (
        <NavLink key={tab.href} href={tab.href}>
          {tab.label}
        </NavLink>
      ))}
      <span className="bg-stone h-4 w-px" aria-hidden />
      {categories.map((category) => (
        <NavLink key={category.id} href={`/discover/${category.slug}`}>
          {category.name}
        </NavLink>
      ))}
      <NavLink href="/discover/all">All categories</NavLink>
    </nav>
  )
}
