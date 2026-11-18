import type { NextConfig } from 'next'

type Redirects = NonNullable<NextConfig['redirects']>
type Redirect = Awaited<ReturnType<Redirects>>[number]

/** The original app's AUTH_DOMAIN, which is where it sent every /wtf/** page (document.location.href). */
export const authOrigin = (env: Record<string, string | undefined> = process.env): string =>
  (env.AUTH_DOMAIN ?? env.API_ORIGIN ?? 'https://ello.co').replace(/\/+$/, '')

/**
 * Routes the original handled with a redirect instead of a page:
 * `artist-invites(/:slug)` moved to `invites(/:slug)`, `find` replaced itself with `/search` (dropping the query), and `wtf(/**)` left the app for AUTH_DOMAIN.
 */
export const legacyRedirects = (env: Record<string, string | undefined> = process.env): Redirect[] => [
  { source: '/find', destination: '/search', permanent: false },
  { source: '/find/', destination: '/search', permanent: false },
  { source: '/starred', destination: '/following', permanent: false },
  { source: '/artist-invites', destination: '/invites', permanent: false },
  { source: '/artist-invites/:slug', destination: '/invites/:slug', permanent: false },
  { source: '/wtf', destination: `${authOrigin(env)}/wtf`, permanent: false },
  { source: '/wtf/:path*', destination: `${authOrigin(env)}/wtf/:path*`, permanent: false },
]
