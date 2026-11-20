import type { ComponentType } from 'react'
import * as icons from '@/components/icons'
import { GuideIntro, GuideSection } from './guide-section'
import styles from './specimens.module.css'

/** Exports of components/icons that are building blocks (shapes, wrappers, helpers), not icons. */
export const ICON_PARTS: ReadonlySet<string> = new Set([
  'cx',
  'SVGComponent',
  'SVGIcon',
  'SVGBox',
  'FillShapeForty',
  'FillShapeSixty',
  'SmileShapeForty',
  'BadgeShape',
  'CheckShape',
])

/** Every icon of components/icons by export name. None of them needs a prop. */
export const ICONS: ReadonlyArray<readonly [string, ComponentType]> = Object.entries(icons)
  .filter(([name]) => !ICON_PARTS.has(name))
  .map(([name, Icon]) => [name, Icon as ComponentType] as const)
  .sort(([a], [b]) => a.localeCompare(b))

/** The icon set (what the header's Icons button jumps to). */
export const IconSection = () => (
  <GuideSection id="icons" title="Icons">
    <GuideIntro>
      The {ICONS.length} icons of <code>components/icons</code>, ported from the original&rsquo;s <code>Icons.js</code>.
      They draw in <code>currentColor</code>; hover one to see it on black.
    </GuideIntro>
    <ul className={styles.icons}>
      {ICONS.map(([name, Icon]) => (
        <li key={name} className={styles.icon}>
          <div className={styles.iconArt}>
            <Icon />
          </div>
          <code className={styles.iconName} title={name}>
            {name}
          </code>
        </li>
      ))}
    </ul>
  </GuideSection>
)
