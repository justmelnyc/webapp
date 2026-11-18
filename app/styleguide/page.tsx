import type { Metadata } from 'next'
import styles from './styleguide.module.css'

export const metadata: Metadata = { title: 'Style guide' }

/** The original's dev-only /styleguide: a heading and an (inert) Icons button. */
const StyleGuidePage = () => (
  <div className="StyleGuide">
    <header className={styles.header}>
      <h1 className={styles.title}>Ello style guide</h1>
      <nav className={styles.nav}>
        <button type="button" className={styles.button}>Icons</button>
      </nav>
    </header>
  </div>
)

export default StyleGuidePage
