/** The original's ONBOARDING_VERSION: saved on the profile when the creator type step is done. */
export const ONBOARDING_VERSION = '3'

/** How many categories someone has to pick before the categories step lets them continue. */
export const CATEGORIES_NEEDED = 1

/** Where the steps go, in order, and where onboarding ends. */
export const ONBOARDING_ROUTES = {
  creatorType: '/onboarding/creator-type',
  categories: '/onboarding/categories',
  settings: '/onboarding/settings',
  collaborate: '/onboarding/collaborate',
  done: '/following',
} as const
