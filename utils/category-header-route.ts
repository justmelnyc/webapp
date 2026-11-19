const GLOBAL_ROOT = /^\/(?:discover(\/featured|\/recommended|\/trending|\/recent|\/shop)?)?$/
const SUBSCRIBED_ROOT = /^\/(?:discover\/subscribed(\/trending|\/shop|\/recent)?)?$/

/** Port of `selectShowCategoryHeader` (legacy/src/selectors/routing.js): only the global and subscribed feeds name a post's category. */
export const showsCategoryHeader = (pathname: string): boolean =>
  GLOBAL_ROOT.test(pathname) || SUBSCRIBED_ROOT.test(pathname)
