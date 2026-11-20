import { Z_TOKENS } from '@/constants/design-tokens'
import { GuideIntro, GuideSection, TokenRow, TokenRows } from './guide-section'
import styles from './specimens.module.css'

/** The z-index layers, the one on top first. */
export const LayerSection = () => (
  <GuideSection id="layers" title="Z layers">
    <GuideIntro>
      Anything that floats over the page takes one of these, listed from the top down. Inside a component, small local
      numbers (<code>z-index: 1</code> to <code>4</code>) are fine.
    </GuideIntro>
    <TokenRows>
      {[...Z_TOKENS].reverse().map((token) => (
        <TokenRow key={token.name} token={token}>
          <div className={styles.plate}>{token.name.replace('--z-', '')}</div>
        </TokenRow>
      ))}
    </TokenRows>
  </GuideSection>
)
