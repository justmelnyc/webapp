import { BreakpointSection } from './breakpoint-section'
import { ColourSection } from './colour-section'
import { IconSection } from './icon-section'
import { LayerSection } from './layer-section'
import { MotionSection } from './motion-section'
import { PrimitiveSection } from './primitive-section'
import { SizeSection } from './size-section'
import { TypeSection } from './type-section'
import styles from './styleguide.module.css'

const CONTENTS = [
  ['colours', 'Colours'],
  ['type', 'Type'],
  ['sizes', 'Spacing and sizes'],
  ['breakpoints', 'Breakpoints'],
  ['motion', 'Motion'],
  ['layers', 'Z layers'],
  ['icons', 'Icons'],
  ['primitives', 'Primitives'],
] as const

interface StyleGuideProps {
  assetOrigin: string
  avatarUrl: string
}

/** The living guide under the original's /styleguide header: tokens (from constants/design-tokens), icons, primitives. */
export const StyleGuide = ({ assetOrigin, avatarUrl }: StyleGuideProps) => (
  <div className={styles.guide}>
    <nav className={styles.contents} aria-label="Style guide sections">
      {CONTENTS.map(([id, title]) => (
        <a key={id} href={`#${id}`}>
          {title}
        </a>
      ))}
    </nav>
    <ColourSection />
    <TypeSection />
    <SizeSection />
    <BreakpointSection />
    <MotionSection />
    <LayerSection />
    <IconSection />
    <PrimitiveSection assetOrigin={assetOrigin} avatarUrl={avatarUrl} />
  </div>
)
