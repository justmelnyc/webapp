import { beginNavigation, type NavigationType } from '@/stores/navigation-store'

/**
 * Next calls this the moment a client-side navigation starts, before the new page's data is asked for. The
 * original app switched views at once and drew a loader; `components/layout/pending-route.tsx` does the same
 * with what is recorded here.
 */
export const onRouterTransitionStart = (url: string, navigationType: NavigationType): void => {
  beginNavigation(url, navigationType)
}
