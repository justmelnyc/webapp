/**
 * Original `:username(/:type)` route: a username with capitals redirects to the lowercase path.
 * Returns the path to redirect to, or null when nothing needs to change.
 */
const RESERVED = /^\/(?:_next|api|mock-s3)(?:\/|$)/

export const lowercaseUsernamePath = (pathname: string): string | null => {
  if (RESERVED.test(pathname)) return null
  const [, first, ...rest] = pathname.split('/')
  if (!first || first === first.toLowerCase()) return null
  return `/${[first.toLowerCase(), ...rest].join('/')}`
}
