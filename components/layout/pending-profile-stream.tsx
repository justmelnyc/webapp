'use client'

import type { ReactNode } from 'react'
import styles from './pending-main.module.css'
import { isProfileTabChange } from './route-loading'
import { StreamBusy } from './route-loading-view'
import { usePendingNavigation } from './use-pending-navigation'

/**
 * A profile's content under its hero. Switching between posts, loves, following and followers keeps the hero
 * (as the original's `UserDetail` did) and shows the stream's loader until the tab's page is there.
 */
export const PendingProfileStream = ({ children }: { children: ReactNode }) => {
  const pending = usePendingNavigation()
  if (pending && isProfileTabChange(pending.to, pending.from)) return <StreamBusy className={styles.nested} />
  return children
}
