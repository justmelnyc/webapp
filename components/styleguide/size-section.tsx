import { CONTAINER_TOKENS, CONTROL_TOKENS, RADIUS_TOKENS, SPACING_TOKENS } from '@/constants/design-tokens'
import { GuideIntro, GuideSection, GuideSubTitle, TokenRow, TokenRows } from './guide-section'
import styles from './styleguide.module.css'

/** The steps the original's spacing helpers come in (jso.js p5 ... p40, m60). */
const SPACING_STEPS = [5, 10, 20, 30, 40, 60] as const

/** Each radius is drawn on the height it is for: the pills are half of 40, 30 and 22px. */
const RADIUS_HEIGHT: Readonly<Record<string, string>> = {
  '--radius-box': 'var(--control)',
  '--radius-pill': 'var(--control)',
  '--radius-pill-small': 'var(--control-small)',
  '--radius-pill-tiny': '22px',
}

/** Spacing, control heights, radii and page widths. */
export const SizeSection = () => (
  <GuideSection id="sizes" title="Spacing and sizes">
    <GuideIntro>
      One spacing unit is one pixel, so <code>p-10</code> is the original&rsquo;s <code>p10</code>. Spacing has no tokens of
      its own: keep to the steps the original uses.
    </GuideIntro>
    <GuideSubTitle>Spacing</GuideSubTitle>
    <TokenRows>
      {SPACING_STEPS.map((step) => (
        <TokenRow key={step} token={{ name: `--spacing`, value: `${step} × ${SPACING_TOKENS[0].value}`, note: `p-${step}, m-${step}, gap-${step}` }}>
          <div className={styles.step} style={{ width: step }} />
        </TokenRow>
      ))}
    </TokenRows>
    <GuideSubTitle>Control heights</GuideSubTitle>
    <TokenRows>
      {CONTROL_TOKENS.map((token) => (
        <TokenRow key={token.name} token={token}>
          <div className={styles.bar} style={{ height: `var(${token.name})` }} />
        </TokenRow>
      ))}
    </TokenRows>
    <GuideSubTitle>Radii</GuideSubTitle>
    <TokenRows>
      {RADIUS_TOKENS.map((token) => (
        <TokenRow key={token.name} token={token}>
          <div className={styles.radius} style={{ height: RADIUS_HEIGHT[token.name], borderRadius: `var(${token.name})` }} />
        </TokenRow>
      ))}
    </TokenRows>
    <GuideSubTitle>Page widths</GuideSubTitle>
    <TokenRows>
      {CONTAINER_TOKENS.map((token) => (
        <TokenRow key={token.name} token={token}>
          <div className={styles.container} style={{ width: `calc(var(${token.name}) / 8)` }} />
        </TokenRow>
      ))}
    </TokenRows>
  </GuideSection>
)
