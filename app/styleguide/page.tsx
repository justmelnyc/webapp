import type { Metadata } from 'next'
import { IconsButton } from '@/components/styleguide/icons-button'
import { StyleGuide } from '@/components/styleguide/style-guide'
import { API_ORIGIN } from '@/lib/env'
import { getViewer } from '@/services/viewer'
import { avatarUrl } from '@/utils/images'
import styles from './styleguide.module.css'

/** Logged out there is no avatar to show, so the picture specimens use the app icon. */
const FALLBACK_PICTURE = '/icon.svg'

export const metadata: Metadata = { title: 'Style guide' }

/**
 * The header is the original's dev-only /styleguide (a heading and an Icons button, which did
 * nothing there). The living guide beneath it is an addition the original does not have.
 */
const StyleGuidePage = async () => {
  const viewer = await getViewer()
  return (
    <div className="StyleGuide">
      <header className={styles.header}>
        <h1 className={styles.title}>Ello style guide</h1>
        <nav className={styles.nav}>
          <IconsButton className={styles.button} />
        </nav>
      </header>
      <StyleGuide assetOrigin={API_ORIGIN} avatarUrl={avatarUrl(viewer?.avatar, 'regular') ?? FALLBACK_PICTURE} />
    </div>
  )
}

export default StyleGuidePage
