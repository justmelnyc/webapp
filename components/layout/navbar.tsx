import type { ReactNode } from 'react'
import { CircleIcon, SearchIcon, SparklesIcon } from '@/components/icons'
import { API_ORIGIN } from '@/lib/env'
import { getCategories } from '@/services/content'
import type { Category } from '@/types/content'
import type { Viewer } from '@/types/user'
import { avatarUrl } from '@/utils/images'
import { CategoryTabBar, type CategoryTab } from './category-tab-bar'
import { NavbarIconLink, NavbarLink } from './navbar-link'
import linkStyles from './navbar-link.module.css'
import { NavbarOmniButton } from './navbar-omni-button'
import { NavbarLayoutTool } from './navbar-layout-tool'
import { NotificationsBoltLink } from '@/components/notifications/notifications-bolt-link'
import { NotificationsDropdown } from '@/components/notifications/notifications-dropdown'
import { NavbarMark } from './navbar-mark'
import { NavbarNewPosts } from './navbar-new-posts'
import { NavbarProfile } from './navbar-profile'
import styles from './navbar.module.css'

const safeCategories = (): Promise<Category[]> => getCategories().catch(() => [])

/** selectCategoryTabs: promo categories first; logged out viewers also get the primary ones. */
const toTabs = (categories: Category[], isLoggedIn: boolean): CategoryTab[] =>
  categories
    .filter((c) => c.level === 'promo' || (!isLoggedIn && c.level === 'primary'))
    .sort((a, b) => Number(b.level === 'promo') - Number(a.level === 'promo'))
    .map((c) => ({
      label: c.name,
      slug: c.slug,
      isPromo: c.level === 'promo',
      small: c.tileImage?.small?.url ?? null,
      large: c.tileImage?.large?.url ?? null,
    }))

interface NavbarShellProps {
  children: ReactNode
  tabBar: ReactNode
}

const NavbarShell = ({ children, tabBar }: NavbarShellProps) => (
  <nav aria-label="Main" className={`Navbar ${styles.navbar}`}>
    <div className={`navbar-content ${styles.content}`}>
      <div className={`navbar-container ${styles.container}`}>
        <div className={`NavbarMain ${styles.main}`}>{children}</div>
      </div>
      {tabBar}
    </div>
  </nav>
)

const LoggedOutLinks = () => (
  <>
    <div className={`NavbarLinks ${linkStyles.links}`}>
      <NavbarLink href="/" label="Editorial" className={linkStyles.editorial} />
      <NavbarLink href="/invites" label="Invites" />
      <NavbarLink href="/discover" label="Discover" icon={<SparklesIcon />} />
      <NavbarLink href="/elloartgiveaways" label="Giveaways" />
      <NavbarIconLink href="/search" label="Search" icon={<SearchIcon />} />
    </div>
    <NavbarLink href="/enter" label="Login" className="isLogin" />
    <NavbarLink href="/join" label="Sign Up" className="isSignUp" />
  </>
)

const LoggedInLinks = () => (
  <div className={`NavbarLinks ${linkStyles.links}`}>
    <NavbarLink href="/" label="Editorial" className={linkStyles.editorial} />
    <NavbarLink href="/invites" label="Invites" className={linkStyles.invites} />
    <NavbarLink href="/discover/subscribed" label="Discover" icon={<SparklesIcon />} />
    <NavbarLink href="/following" label="Following" icon={<CircleIcon />} />
    <NavbarLink href="/elloartgiveaways" label="Giveaways" className={linkStyles.giveaways} />
    <NotificationsBoltLink />
    <NavbarIconLink href="/search" label="Search" icon={<SearchIcon />} />
  </div>
)

/** The fixed top bar. The Discover category strip shows itself on /discover pages (not /discover/all). */
export const Navbar = async ({ viewer }: { viewer: Viewer | null }) => {
  const categories = await safeCategories()
  const tabBar = <CategoryTabBar tabs={toTabs(categories, !!viewer)} isLoggedIn={!!viewer} />
  return (
    <NavbarShell tabBar={tabBar}>
      <NavbarMark />
      <NavbarNewPosts />
      {viewer ? (
        <>
          <LoggedInLinks />
          <NavbarProfile
            username={viewer.username}
            avatarSrc={avatarUrl(viewer.avatar, 'regular')}
            helpHref={`${API_ORIGIN}/wtf`}
          />
          <NavbarLayoutTool />
          <NavbarOmniButton categories={categories} />
          <NotificationsDropdown assetOrigin={API_ORIGIN} />
        </>
      ) : (
        <LoggedOutLinks />
      )}
    </NavbarShell>
  )
}
