'use client'

import { useSearchParams } from 'next/navigation'
import type { ReactNode } from 'react'
import { StreamBusy } from './route-loading-view'
import { usePendingQuery } from './use-pending-navigation'

/**
 * The results of a page that is driven by its query string (search). While a new query is out the original's
 * `StreamContainer` drew its loader in place of the results; this does the same until the page for that query
 * arrives.
 */
export const PendingQuery = ({ children }: { children: ReactNode }) => {
  const isPending = usePendingQuery(useSearchParams().toString())
  return isPending ? <StreamBusy /> : children
}
