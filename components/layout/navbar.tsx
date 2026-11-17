import Link from 'next/link'
import { ComposeButton } from '@/components/composer/compose-button'
import { NavLink } from '@/components/layout/nav-link'
import { UserMenu } from '@/components/layout/user-menu'
import { getCategories } from '@/services/content'
import { getViewer } from '@/services/viewer'

export const Navbar = async () => {
  const viewer = await getViewer()
  const categories = viewer ? await getCategories().catch(() => []) : []
  return (
    <header className="border-stone bg-paper/95 sticky top-0 z-50 border-b backdrop-blur">
      <div className="mx-auto flex h-20 max-w-[120rem] items-center gap-8 px-5">
        <Link href="/" className="text-2xl font-black tracking-tight">
          ELLO
        </Link>
        <nav aria-label="Main" className="flex items-center gap-6">
          <NavLink href="/discover" matchPrefix="/discover">
            Discover
          </NavLink>
          {viewer && <NavLink href="/following">Following</NavLink>}
          <NavLink href="/search">Search</NavLink>
        </nav>
        <div className="ml-auto flex items-center gap-5">
          {viewer ? (
            <>
              <UserMenu viewer={viewer} />
              <ComposeButton categories={categories} />
            </>
          ) : (
            <>
              <Link href="/enter" className="text-slate hover:text-ink text-sm">
                Log in
              </Link>
              <Link href="/join" className="bg-ello-green rounded-sm px-4 py-2 text-sm font-medium text-white">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
