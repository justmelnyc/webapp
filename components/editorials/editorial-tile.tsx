import Link from 'next/link'
import { BackgroundImage } from '@/components/heroes/background-image'
import type { Editorial } from '@/types/content'
import { responsiveUrl } from '@/utils/images'
import { cleanHtml } from '@/utils/sanitize'
import { EditorialTools } from './editorial-tools'
import styles from './editorial-tile.module.css'

export type EditorialSize = '1x1' | '2x1' | '1x2' | '2x2'

const imageFor = (editorial: Editorial, size: EditorialSize): string | null => {
  switch (size) {
    case '2x2':
      return responsiveUrl(editorial.twoByTwoImage)
    case '2x1':
      return responsiveUrl(editorial.twoByOneImage)
    // The API's `oneByTwoImage` is not fetched yet (types/content.ts); use the square art.
    case '1x2':
    case '1x1':
      return responsiveUrl(editorial.oneByOneImage)
  }
}

interface EditorialTileProps {
  editorial: Editorial
  size: EditorialSize
  signedIn: boolean
}

/** One editorial module (the original's EditorialContainer: link, title, subtitle, tools, image). */
export const EditorialTile = ({ editorial, size, signedIn }: EditorialTileProps) => {
  const { post } = editorial
  const href = editorial.path ?? editorial.url
  const isExternal = !editorial.path && !!editorial.url
  const showTools = editorial.kind === 'POST' && !!post && !!editorial.path
  const linkText = <span className={styles.linkText}>{href}</span>
  return (
    <div className={styles.base}>
      {href && !isExternal && (
        <Link href={href} className={styles.link}>
          {linkText}
        </Link>
      )}
      {href && isExternal && (
        <a href={href} className={styles.link} rel="noopener noreferrer" target="_blank">
          {linkText}
        </a>
      )}
      <header className={styles.header}>
        <h2 className={styles.title}>{editorial.title}</h2>
      </header>
      <div className={styles.body}>
        <div className={styles.subtitle} dangerouslySetInnerHTML={{ __html: cleanHtml(editorial.subtitle ?? '') }} />
        {showTools && (
          <div className={styles.tools}>
            <EditorialTools
              postId={post.id}
              postPath={editorial.path ?? ''}
              loved={post.currentUserState.loved}
              signedIn={signedIn}
            />
          </div>
        )}
      </div>
      <div className={styles.overlay} />
      <BackgroundImage src={imageFor(editorial, size)} />
    </div>
  )
}
