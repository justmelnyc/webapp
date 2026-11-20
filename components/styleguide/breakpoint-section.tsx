import { BREAKPOINTS } from '@/constants/design-tokens'
import { cn } from '@/utils/cn'
import { GuideIntro, GuideSection, TokenRows } from './guide-section'
import styles from './styleguide.module.css'

/** The six breakpoints, with a dot that is green while the viewport is at or above each. */
export const BreakpointSection = () => (
  <GuideSection id="breakpoints" title="Breakpoints">
    <GuideIntro>
      Mobile first, in em (16px to the em). A custom property cannot be used inside <code>@media</code>, so write the value
      out: <code>@media (min-width: 40em)</code>. The utilities take the short names (<code>bp2:flex</code>). Hover styles
      go inside <code>@media (hover: hover)</code>.
    </GuideIntro>
    <TokenRows>
      {BREAKPOINTS.map(({ id, token, legacy, px, max }) => (
        <div key={token.name} className={cn(styles.row, styles[id])}>
          <div className={styles.rowSpecimen}>
            <span className={styles.dot} />
            <span className={styles.breakpointName}>
              {id} &middot; {px}px
            </span>
          </div>
          <div className={styles.rowMeta}>
            <code className={styles.token}>{`@media (min-width: ${token.value})`}</code>
            <code className={styles.value}>{max ? `below it: @media (max-width: ${max})` : token.name}</code>
            <span className={styles.note}>{legacy}</span>
          </div>
        </div>
      ))}
    </TokenRows>
  </GuideSection>
)
