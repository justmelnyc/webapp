import { isNotificationTab, type NotificationTab } from '@/types/notification'

/**
 * What the original drew the moment a route was opened, before its data arrived (each view's own render
 * while its `StreamContainer` request was out). `null` keeps the page that is open until the new one is
 * ready. That is the case where the original had nothing to wait for (settings, invitations, the sign in
 * screens) and for detail views (a profile, a post, an artist invite): there the original showed the record
 * it already held in its store at once, with only the stream under it loading, and this app has no such
 * record in the browser to draw from.
 */
export type RouteLoading =
  | { kind: 'editorial' }
  | { kind: 'following' }
  | { kind: 'discover'; slug: string | null; section: DiscoverSection }
  | { kind: 'invites' }
  | { kind: 'notifications'; tab: NotificationTab }
  | { kind: 'search' }

export type DiscoverSection = 'featured' | 'trending' | 'recent' | 'shop'

const SECTIONS: readonly string[] = ['featured', 'trending', 'recent', 'shop']
const isSection = (value: string | undefined): value is DiscoverSection => !!value && SECTIONS.includes(value)

/** First path segments that are pages of their own, not usernames. */
const RESERVED = new Set([
  'api', 'auth', 'discover', 'enter', 'following', 'forgot-password', 'invitations', 'invites', 'join',
  'notifications', 'onboarding', 'search', 'settings', 'signup', 'styleguide', 'wtf', 'find', 'starred', 'artist-invites',
])

const segmentsOf = (pathname: string): string[] => pathname.split('/').filter(Boolean)

/** The profile a path belongs to (`/ada`, `/ada/loves`), or null for posts and the app's own pages. */
export const profileOf = (pathname: string): string | null => {
  const [first, second, ...rest] = segmentsOf(pathname)
  if (!first || RESERVED.has(first) || rest.length > 0) return null
  if (second && !['loves', 'following', 'followers'].includes(second)) return null
  return first.toLowerCase()
}

const discoverLoading = (segments: string[]): RouteLoading | null => {
  const [first, second, ...rest] = segments
  if (rest.length > 0 || first === 'all') return null
  if (!first) return { kind: 'discover', slug: null, section: 'featured' }
  if (isSection(first)) return second ? null : { kind: 'discover', slug: null, section: first }
  if (!second) return { kind: 'discover', slug: first, section: 'featured' }
  return isSection(second) ? { kind: 'discover', slug: first, section: second } : null
}

/** The loading view for opening `to` while on `from`; null keeps the open page until `to` is ready. */
export const routeLoading = (to: string): RouteLoading | null => {
  const [first, ...rest] = segmentsOf(to)
  if (!first) return { kind: 'editorial' }
  if (first === 'following') return rest.length === 0 || (rest.length === 1 && rest[0] === 'trending') ? { kind: 'following' } : null
  if (first === 'discover') return discoverLoading(rest)
  if (first === 'invites') return rest.length === 0 ? { kind: 'invites' } : null
  if (first === 'search') return rest.length === 0 ? { kind: 'search' } : null
  if (first === 'notifications') {
    if (rest.length === 0) return { kind: 'notifications', tab: 'all' }
    return rest.length === 1 && isNotificationTab(rest[0]) ? { kind: 'notifications', tab: rest[0] } : null
  }
  return null
}

/**
 * Opening another tab (posts, loves, following, followers) of the profile that is already open: the hero
 * stays and only the stream under it waits (see PendingProfileStream).
 */
export const isProfileTabChange = (to: string, from: string): boolean => {
  const profile = profileOf(to)
  return !!profile && profile === profileOf(from) && to !== from
}
