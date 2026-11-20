import { FONT_TOKENS, TEXT_TOKENS } from '@/constants/design-tokens'
import { GuideIntro, GuideSection, GuideSubTitle, TokenRow, TokenRows } from './guide-section'
import styles from './styleguide.module.css'

/** Only the bold cut carries a weight (properties.css `--sanserif-bold`: 700); the others are 400. */
const WEIGHT: Readonly<Record<string, number>> = { '--font-bold': 700 }

/** The font stacks and the size scale. */
export const TypeSection = () => (
  <GuideSection id="type" title="Type">
    <GuideIntro>
      Atlas Grotesk in four cuts and Atlas Typewriter. Each cut is its own family, so pick the family and leave{' '}
      <code>font-weight</code> alone (only the bold stack is set at 700). Body text is 14px.
    </GuideIntro>
    <GuideSubTitle>Font stacks</GuideSubTitle>
    <TokenRows>
      {FONT_TOKENS.map((token) => (
        <TokenRow key={token.name} token={token}>
          <span className={styles.sample} style={{ fontFamily: `var(${token.name})`, fontSize: 'var(--text-24)', fontWeight: WEIGHT[token.name] ?? 400 }}>
            The Creators Network.
          </span>
        </TokenRow>
      ))}
    </TokenRows>
    <GuideSubTitle>Size scale</GuideSubTitle>
    <TokenRows>
      {TEXT_TOKENS.map((token) => (
        <TokenRow key={token.name} token={token}>
          <span className={styles.sample} style={{ fontSize: `var(${token.name})` }}>
            Be inspired.
          </span>
        </TokenRow>
      ))}
    </TokenRows>
  </GuideSection>
)
