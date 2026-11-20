import { COLOR_TOKENS } from '@/constants/design-tokens'
import { GuideIntro, GuideSection, TokenMeta } from './guide-section'
import styles from './styleguide.module.css'

/** Every colour token as a swatch with its name and value. */
export const ColourSection = () => (
  <GuideSection id="colours" title="Colours">
    <GuideIntro>
      Ello is black, white and a handful of greys, with green for the things you can do. Greys are named <code>g</code> plus
      their hex. Use <code>var(--color-…)</code> in CSS, or the utility (<code>text-gaa</code>, <code>bg-green</code>).
    </GuideIntro>
    <ul className={styles.swatches}>
      {COLOR_TOKENS.map((token) => (
        <li key={token.name}>
          <div className={styles.chipClear}>
            <div className={styles.chip} style={{ backgroundColor: `var(${token.name})` }} />
          </div>
          <TokenMeta token={token} />
        </li>
      ))}
    </ul>
  </GuideSection>
)
