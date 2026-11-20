import type { ReactNode } from 'react'
import type { DesignToken } from '@/constants/design-tokens'
import styles from './styleguide.module.css'

interface GuideSectionProps {
  id: string
  title: string
  children: ReactNode
}

/** One titled section of the style guide; its `id` is the anchor the contents line links to. */
export const GuideSection = ({ id, title, children }: GuideSectionProps) => (
  <section id={id} className={styles.section} aria-labelledby={`${id}-title`}>
    <h2 id={`${id}-title`} className={styles.sectionTitle}>
      {title}
    </h2>
    {children}
  </section>
)

export const GuideIntro = ({ children }: { children: ReactNode }) => <p className={styles.intro}>{children}</p>

export const GuideSubTitle = ({ children }: { children: ReactNode }) => <h3 className={styles.subTitle}>{children}</h3>

/** A token's name, value and note, as three lines. */
export const TokenMeta = ({ token }: { token: DesignToken }) => (
  <>
    <code className={styles.token}>{token.name}</code>
    <code className={styles.value}>{token.value}</code>
    {token.note ? <span className={styles.note}>{token.note}</span> : null}
  </>
)

export const TokenRows = ({ children }: { children: ReactNode }) => <div className={styles.rows}>{children}</div>

interface TokenRowProps {
  token: DesignToken
  className?: string
  /** The specimen drawn with the token. */
  children: ReactNode
}

/** A specimen on the left and the token that draws it on the right. */
export const TokenRow = ({ token, className, children }: TokenRowProps) => (
  <div className={className ? `${styles.row} ${className}` : styles.row}>
    <div className={styles.rowSpecimen}>{children}</div>
    <div className={styles.rowMeta}>
      <TokenMeta token={token} />
    </div>
  </div>
)
