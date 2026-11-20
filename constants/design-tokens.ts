/*
 * Every design token of app/styles/tokens.css, as data. The style guide (/styleguide) is drawn from
 * this file, and constants/design-tokens.test.ts fails when it and tokens.css disagree, so add a
 * token in both places.
 */
export interface DesignToken {
  /** The custom property, e.g. `--color-black`. */
  name: `--${string}`
  /** Its value, exactly as written in tokens.css. */
  value: string
  /** What the original calls it, or where it is used. */
  note?: string
}

export type BreakpointId = 'bp2' | 'bp3' | 'bp4' | 'bp5' | 'bp6' | 'bp7'

export interface Breakpoint {
  /** The short name the utilities take (`bp2:flex`). */
  id: BreakpointId
  token: DesignToken
  /** The original's name (`minBreak2`, `--break-2`). */
  legacy: string
  px: number
  /** The matching `max-width` query (the pixel below), where the original defines one. */
  max?: string
}

const SANS_FALLBACK = "'Helvetica Neue', 'HelveticaNeue', 'Helvetica', sans-serif"

export const COLOR_TOKENS = [
  { name: '--color-black', value: '#000', note: 'colorBlack' },
  { name: '--color-white', value: '#fff', note: 'colorWhite' },
  { name: '--color-g4d', value: '#4d4d4d', note: 'bgc4' },
  { name: '--color-g53', value: '#535353', note: 'color5' },
  { name: '--color-g66', value: '#666', note: 'color6' },
  { name: '--color-g6a', value: '#6a6a6a', note: 'black button hover' },
  { name: '--color-g99', value: '#999', note: 'color9' },
  { name: '--color-gaa', value: '#aaa', note: 'colorA' },
  { name: '--color-gcc', value: '#ccc', note: 'colorC' },
  { name: '--color-gd8', value: '#d8d8d8', note: 'box control at rest' },
  { name: '--color-ge5', value: '#e5e5e5', note: 'bgcE5' },
  { name: '--color-ge8', value: '#e8e8e8', note: 'pill tools, key caps' },
  { name: '--color-gea', value: '#eaeaea', note: 'bgcEA' },
  { name: '--color-gf0', value: '#f0f0f0', note: 'blank avatar, onboarding bar' },
  { name: '--color-gf1', value: '#f1f1f1', note: 'light grey fill' },
  { name: '--color-gf2', value: '#f2f2f2', note: 'bgcF2' },
  { name: '--color-green', value: '#00d100', note: 'colorGreen' },
  { name: '--color-green-hover', value: '#00b100', note: 'green button hover / active' },
  { name: '--color-green-toggle', value: '#0c0', note: 'ToggleControl isChecked' },
  { name: '--color-submit-hover', value: '#02b302', note: 'PostActionButton forSubmit hover' },
  { name: '--color-dark-green', value: '#16a905', note: 'colorDarkGreen' },
  { name: '--color-pale-green', value: '#cfc', note: 'drag-over highlight' },
  { name: '--color-yellow', value: '#ffc600', note: 'colorYellow' },
  { name: '--color-pale-yellow', value: '#ffc', note: 'bgcYellow' },
  { name: '--color-red', value: '#f00', note: 'bgcRed' },
  { name: '--color-dark-red', value: '#c90000', note: 'colorRed' },
  { name: '--color-pale-red', value: '#f99', note: 'loved heart, busy' },
  { name: '--color-danger', value: '#f00', note: '--color-danger' },
  { name: '--color-success', value: '#06a54f', note: '--color-success' },
  { name: '--color-modal', value: 'rgba(26, 26, 26, 0.9)', note: 'bgcModal' },
  { name: '--color-transparent', value: 'transparent', note: 'bgcTransparent' },
] as const satisfies readonly DesignToken[]

export const FONT_TOKENS = [
  { name: '--font-sans', value: `'AtlasGroteskRegular', 'AtlasGrotesk-Regular', ${SANS_FALLBACK}`, note: 'sansRegular' },
  { name: '--font-bold', value: `'AtlasGroteskBold', 'AtlasGrotesk-Bold', ${SANS_FALLBACK}`, note: 'sansBold' },
  { name: '--font-black', value: `'AtlasGroteskBlack', 'AtlasGrotesk-Black', ${SANS_FALLBACK}`, note: 'sansBlack' },
  { name: '--font-light', value: `'AtlasGroteskLight', 'AtlasGrotesk-Light', ${SANS_FALLBACK}`, note: 'sansLight' },
  {
    name: '--font-mono',
    value: "'AtlasTypewriterRegular', 'AtlasTypewriter-Regular', 'Andale Mono', 'Consolas', 'Lucida Console', 'Menlo', 'Luxi Mono', monospace",
    note: 'monoRegular',
  },
] as const satisfies readonly DesignToken[]

export const TEXT_TOKENS = [
  { name: '--text-12', value: '12px', note: 'fontSize12' },
  { name: '--text-14', value: '14px', note: 'fontSize14 (body)' },
  { name: '--text-16', value: '16px', note: 'fontSize16' },
  { name: '--text-18', value: '18px', note: 'fontSize18' },
  { name: '--text-24', value: '24px', note: 'fontSize24' },
  { name: '--text-28', value: '28px', note: 'fontSize28' },
  { name: '--text-32', value: '32px', note: 'fontSize32' },
  { name: '--text-38', value: '38px', note: 'fontSize38' },
  { name: '--text-48', value: '48px', note: 'fontSize48' },
  { name: '--text-56', value: '56px', note: 'fontSize56' },
] as const satisfies readonly DesignToken[]

export const SPACING_TOKENS = [
  { name: '--spacing', value: '1px', note: 'one utility unit is one pixel: p-10 is the original p10' },
] as const satisfies readonly DesignToken[]

export const CONTROL_TOKENS = [
  { name: '--control', value: '40px', note: 'hv40 / lh40: buttons, inputs' },
  { name: '--control-small', value: '30px', note: 'hv30 / lh30: pills, toggles' },
] as const satisfies readonly DesignToken[]

export const RADIUS_TOKENS = [
  { name: '--radius-box', value: '5px', note: 'inputs, buttons, dialogs' },
  { name: '--radius-pill', value: '20px', note: 'pill of a 40px control' },
  { name: '--radius-pill-small', value: '15px', note: 'pill of a 30px control' },
  { name: '--radius-pill-tiny', value: '11px', note: 'pill of a 22px hint' },
] as const satisfies readonly DesignToken[]

export const CONTAINER_TOKENS = [
  { name: '--container-site', value: '1360px', note: 'maxSiteWidth' },
  { name: '--container-view', value: '1440px', note: 'maxViewWidth' },
] as const satisfies readonly DesignToken[]

export const BREAKPOINTS: readonly Breakpoint[] = [
  { id: 'bp2', token: { name: '--breakpoint-bp2', value: '40em' }, legacy: 'minBreak2', px: 640, max: '39.9375em' },
  { id: 'bp3', token: { name: '--breakpoint-bp3', value: '60em' }, legacy: 'minBreak3', px: 960, max: '59.9375em' },
  { id: 'bp4', token: { name: '--breakpoint-bp4', value: '85em' }, legacy: 'minBreak4', px: 1360, max: '84.9375em' },
  { id: 'bp5', token: { name: '--breakpoint-bp5', value: '107.5em' }, legacy: 'minBreak5', px: 1720, max: '107.4375em' },
  { id: 'bp6', token: { name: '--breakpoint-bp6', value: '130em' }, legacy: 'minBreak6', px: 2080 },
  { id: 'bp7', token: { name: '--breakpoint-bp7', value: '152.5em' }, legacy: 'minBreak7', px: 2440 },
]

export const SPEED_TOKENS = [
  { name: '--speed', value: '0.2s', note: '--speed: hovers, colour changes' },
  { name: '--speed2', value: '0.4s', note: '--speed2: fades, image reveals' },
] as const satisfies readonly DesignToken[]

export const EASE_TOKENS = [
  { name: '--ease-ello', value: 'cubic-bezier(0.23, 1, 0.32, 1)', note: 'ease (--ease)' },
  { name: '--ease-quart', value: 'cubic-bezier(0.77, 0, 0.175, 1)', note: 'easeInOutQuart' },
  { name: '--ease-cubic', value: 'cubic-bezier(0.645, 0.045, 0.355, 1)', note: 'easeInOutCubic' },
] as const satisfies readonly DesignToken[]

export const Z_TOKENS = [
  { name: '--z-popover', value: '1020', note: 'popovers' },
  { name: '--z-footer', value: '1030', note: 'zFooter' },
  { name: '--z-decapitated', value: '1035', note: 'zDecapitated' },
  { name: '--z-navbar', value: '1040', note: 'zNavbar' },
  { name: '--z-omnibar', value: '1060', note: 'the editor' },
  { name: '--z-tools', value: '1070', note: 'zTools' },
  { name: '--z-modal', value: '1080', note: 'zModal' },
  { name: '--z-grid', value: '3000', note: 'zGrid (dev grid)' },
] as const satisfies readonly DesignToken[]

/** Every token above, flat (the test compares this with tokens.css). */
export const ALL_TOKENS: readonly DesignToken[] = [
  ...COLOR_TOKENS,
  ...FONT_TOKENS,
  ...TEXT_TOKENS,
  ...SPACING_TOKENS,
  ...CONTROL_TOKENS,
  ...RADIUS_TOKENS,
  ...CONTAINER_TOKENS,
  ...BREAKPOINTS.map((breakpoint) => breakpoint.token),
  ...SPEED_TOKENS,
  ...EASE_TOKENS,
  ...Z_TOKENS,
]
