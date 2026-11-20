import { EASE_TOKENS, SPEED_TOKENS } from '@/constants/design-tokens'
import { GuideIntro, GuideSection, GuideSubTitle, TokenRow, TokenRows } from './guide-section'
import styles from './specimens.module.css'

/** Speeds and easings; the dot of a row travels when the row is hovered or focused. */
export const MotionSection = () => (
  <GuideSection id="motion" title="Motion">
    <GuideIntro>
      Two speeds and three easings. Colour changes take <code>var(--speed)</code> with plain <code>ease</code>; things that
      move or resize take <code>var(--ease-ello)</code>. Hover a row to see it.
    </GuideIntro>
    <GuideSubTitle>Speeds</GuideSubTitle>
    <TokenRows>
      {SPEED_TOKENS.map((token) => (
        <TokenRow key={token.name} token={token} className={styles.motionRow}>
          <div className={styles.track}>
            <span className={styles.runner} style={{ transition: `left var(${token.name}) ease, background-color var(${token.name}) ease` }} />
          </div>
        </TokenRow>
      ))}
    </TokenRows>
    <GuideSubTitle>Easings (shown at three times --speed2)</GuideSubTitle>
    <TokenRows>
      {EASE_TOKENS.map((token) => (
        <TokenRow key={token.name} token={token} className={styles.motionRow}>
          <div className={styles.track}>
            <span
              className={styles.runner}
              style={{ transition: `left calc(var(--speed2) * 3) var(${token.name}), background-color var(--speed2) ease` }}
            />
          </div>
        </TokenRow>
      ))}
    </TokenRows>
  </GuideSection>
)
