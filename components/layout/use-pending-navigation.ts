'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { isRouteChange, useNavigationStore, type PendingNavigation } from '@/stores/navigation-store'
import { isProfileTabChange, routeLoading, type RouteLoading } from './route-loading'

/** The change of route that is on its way, until the app has left the page it started from. */
export const usePendingNavigation = (): PendingNavigation | null => {
  const pathname = usePathname()
  const pending = useNavigationStore((state) => state.pending)
  const finish = useNavigationStore((state) => state.finish)
  const isOver = !!pending && pending.from !== pathname
  useEffect(() => {
    if (isOver) finish()
  }, [isOver, finish])
  return pending && !isOver && isRouteChange(pending) ? pending : null
}

/**
 * A new query for the page that is open (a search being typed) is on its way. `search` is the page's current
 * query string as `useSearchParams().toString()` gives it; once it is no longer the one the navigation
 * started from, the answer is here.
 */
export const usePendingQuery = (search: string): boolean => {
  const pathname = usePathname()
  const pending = useNavigationStore((state) => state.pending)
  if (!pending || isRouteChange(pending) || pending.from !== pathname) return false
  return pending.fromSearch.replace(/^\?/, '') === search
}

/** The loading view on screen in place of the page (see `PendingMain`), if any. */
export const usePendingLoading = (): { to: string; loading: RouteLoading } | null => {
  const pending = usePendingNavigation()
  const loading = pending ? routeLoading(pending.to) : null
  return pending && loading ? { to: pending.to, loading } : null
}

/**
 * The path the screen is showing: the page being opened once its loading view is up, like the original,
 * whose navbar, category tabs and footer followed the route the moment it changed.
 */
export const useShownPath = (): string => {
  const pathname = usePathname()
  const pending = usePendingNavigation()
  if (!pending) return pathname
  const hasLoader = !!routeLoading(pending.to) || isProfileTabChange(pending.to, pending.from)
  return hasLoader ? pending.to : pathname
}
