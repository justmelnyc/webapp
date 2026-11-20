'use client'

import Link from 'next/link'
import { ChevronIcon, GridIcon, ListIcon, RSSIcon } from '@/components/icons'
import { cn } from '@/utils/cn'
import { scrollWindowTo, tween } from '@/utils/scroll-to-position'
import { FooterForm } from './footer-form'
import { FooterLink, FooterTool } from './footer-parts'
import { isAuthenticationPath, isOnboardingPath, isDiscoverAllPath, isLayoutToolHidden, isPostDetailPath } from './layout-routes'
import { useLayoutModeStore } from './layout-mode-store'
import { useMediaQuery } from './use-media-query'
import styles from './footer.module.css'
import { useShownPath } from './use-pending-navigation'

/** constants/locales/en FOOTER_LINKS */
const LINKS = [
  { label: 'About', to: '/wtf/artists/' },
  { label: 'Help', to: '/wtf/support/' },
  { label: 'Blog', to: '/elloblog' },
  { label: 'Store', to: 'https://store.ello.co' },
  { label: 'Apps', to: '/wtf/resources/apps/' },
  { label: 'Terms', to: '/wtf/policies/terms/' },
  { label: 'Privacy', to: '/wtf/policies/privacy/' },
] as const

/**
 * `onClickScrollToTop`: the window eases to the top over a second (quartic in-out), and so do the post
 * page's two columns, which scroll on their own from 60em.
 */
const scrollToTop = (): void => {
  scrollWindowTo(0)
  for (const name of ['PostList', 'PostSideBar']) {
    const column = document.getElementsByClassName(name)[0]
    if (column) tween(column.scrollTop, 0, (value) => { column.scrollTop = value })
  }
}

/** The bottom bar (FooterRenderables.js). Hidden on the sign in / join screens, like the original. */
export const Footer = ({ isLoggedIn }: { isLoggedIn: boolean }) => {
  const pathname = useShownPath()
  const mode = useLayoutModeStore((state) => state.mode)
  const toggleMode = useLayoutModeStore((state) => state.toggle)
  const isMobile = useMediaQuery('(max-width: 39.9375em)')
  if (isAuthenticationPath(pathname) || isOnboardingPath(pathname)) return null

  const isHidden = isPostDetailPath(pathname) || isDiscoverAllPath(pathname)
  const showTools = isLoggedIn || !isMobile
  const showLayoutTool = showTools && !isLayoutToolHidden(pathname)
  return (
    <footer className={cn('Footer', styles.footer, isHidden && 'hide')}>
      <div className={cn('grabber', styles.grabber)} />
      <div className={cn('footer-content', styles.content)}>
        <div className={cn('footer-container', styles.container)}>
          <div className={styles.links}>
            {LINKS.map((link) => (
              <FooterLink key={link.label} href={link.to} label={link.label} />
            ))}
          </div>
          <div className={cn('FooterTools', styles.tools)}>
            {!isLoggedIn && <FooterForm />}
            {pathname === '/' && (
              <Link className={styles.rss} href="/feeds/editorials" prefetch={false} aria-label="RSS feed">
                <RSSIcon />
              </Link>
            )}
            {showTools && <FooterTool name="TopTool" icon={<ChevronIcon />} label="Top" onClick={scrollToTop} />}
            {showLayoutTool && (
              <FooterTool
                name="LayoutTool"
                icon={mode === 'grid' ? <ListIcon /> : <GridIcon />}
                label={mode === 'grid' ? 'List View' : 'Grid View'}
                onClick={toggleMode}
              />
            )}
          </div>
        </div>
      </div>
    </footer>
  )
}
