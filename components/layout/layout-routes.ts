/** Route classification ported from legacy/src/selectors/routing.js and selectors/gui.js. */

const AUTHENTICATION = [/^\/enter(\/|$)/, /^\/forgot-password(\/|$)/, /^\/auth\/reset-my-password(\/|$)/, /^\/join(\/|$)/, /^\/signup(\/|$)/]

const NO_LAYOUT_TOOLS = [
  /^\/$/,
  /^\/[\w-]+\/post\/.+/,
  /^\/discover\/all\b/,
  /^\/notifications\b/,
  /^\/settings\b/,
  /^\/onboarding\b/,
  /^\/[\w-]+\/following\b/,
  /^\/[\w-]+\/followers\b/,
]

const matchesAny = (patterns: RegExp[], pathname: string): boolean => patterns.some((p) => p.test(pathname))

export const isOnboardingPath = (pathname: string): boolean => /^\/onboarding\b/.test(pathname)
export const isAuthenticationPath = (pathname: string): boolean => matchesAny(AUTHENTICATION, pathname)
export const isLayoutToolHidden = (pathname: string): boolean => matchesAny(NO_LAYOUT_TOOLS, pathname)
export const isPostDetailPath = (pathname: string): boolean => /^\/[\w-]+\/post\/.+/.test(pathname)
export const isDiscoverAllPath = (pathname: string): boolean => /^\/discover\/all\b/.test(pathname)
