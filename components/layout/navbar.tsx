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
import { NavbarAnalyticsLink, NavbarProfile } from './navbar-profile'
import styles from './navbar.module.css'

const safeCategories = (): Promise<Category[]> => getCategories().catch(() => [])

const toTab = (c: Category): CategoryTab => ({
  label: c.name,
  slug: c.slug,
  isPromo: c.level === 'promo',
  small: c.tileImage?.small?.url ?? null,
  large: c.tileImage?.large?.url ?? null,
})

/**
 * selectCategoryTabs: promo categories first, then the ones the viewer subscribed to (in the
 * order they subscribed); logged out viewers get the primary ones instead.
 */
const toTabs = (categories: Category[], viewer: Viewer | null): CategoryTab[] => {
  const promo = categories.filter((c) => c.level === 'promo')
  const subscribedIds = viewer?.followedCategoryIds ?? []
  const rest = viewer
    ? subscribedIds.flatMap((id) => categories.find((c) => c.id === id) ?? [])
    : categories.filter((c) => c.level === 'primary')
  return [...new Set([...promo, ...rest])].map(toTab)
}

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
    <div className={`grabber ${styles.grabber}`} />
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
  const hasSubscriptions = (viewer?.followedCategoryIds ?? []).length > 0
  const tabBar = <CategoryTabBar tabs={toTabs(categories, viewer)} isLoggedIn={!!viewer} hasSubscriptions={hasSubscriptions} />
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
          >
            {viewer.isBrand || viewer.isStaff ? <NavbarAnalyticsLink /> : null}
          </NavbarProfile>
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
