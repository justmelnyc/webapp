'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronIcon, GridIcon, ListIcon, RSSIcon } from '@/components/icons'
import { cn } from '@/utils/cn'
import { FooterForm } from './footer-form'
import { FooterLink, FooterTool } from './footer-parts'
import { isAuthenticationPath, isDiscoverAllPath, isLayoutToolHidden, isPostDetailPath } from './layout-routes'
import { useLayoutModeStore } from './layout-mode-store'
import { useMediaQuery } from './use-media-query'
import styles from './footer.module.css'

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

const scrollToTop = (): void => window.scrollTo({ top: 0, behavior: 'smooth' })

/** The bottom bar (FooterRenderables.js). Hidden on the sign in / join screens, like the original. */
export const Footer = ({ isLoggedIn }: { isLoggedIn: boolean }) => {
  const pathname = usePathname()
  const mode = useLayoutModeStore((state) => state.mode)
  const toggleMode = useLayoutModeStore((state) => state.toggle)
  const isMobile = useMediaQuery('(max-width: 39.9375em)')
  if (isAuthenticationPath(pathname)) return null

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
