import { create } from 'zustand'

/** A client-side navigation that has started but whose page has not arrived yet. */
export interface PendingNavigation {
  /** Pathname being opened. */
  to: string
  /** Pathname the app was on when it started; the navigation is over once the app has left it. */
  from: string
  /** The query strings (`?terms=light`, or empty) on both ends: a search stays on its page and only changes these. */
  toSearch: string
  fromSearch: string
}

interface NavigationState {
  pending: PendingNavigation | null
  begin: (pending: PendingNavigation) => void
  finish: () => void
}

export const useNavigationStore = create<NavigationState>((set) => ({
  pending: null,
  begin: (pending) => set({ pending }),
  finish: () => set({ pending: null }),
}))

export type NavigationType = 'push' | 'replace' | 'traverse'

/**
 * Called by Next when a route transition starts (`instrumentation-client.ts`). Back / forward restore a page
 * the router still has, so they are never pending.
 */
export const beginNavigation = (url: string, type: NavigationType, location: Pick<Location, 'href' | 'pathname' | 'search'> = window.location): void => {
  const { begin, finish } = useNavigationStore.getState()
  if (type === 'traverse') return finish()
  const target = toUrl(url, location.href)
  if (!target || (target.pathname === location.pathname && target.search === location.search)) return finish()
  begin({ to: target.pathname, from: location.pathname, toSearch: target.search, fromSearch: location.search })
}

/** Leaving the page for another one (as opposed to a new query on the same page). */
export const isRouteChange = (pending: PendingNavigation): boolean => pending.to !== pending.from

const toUrl = (url: string, base: string): URL | null => {
  try {
    const target = new URL(url, base)
    return target.origin === new URL(base).origin ? target : null
  } catch {
    return null
  }
}
