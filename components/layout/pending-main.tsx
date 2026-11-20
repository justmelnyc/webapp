'use client'

import { useEffect } from 'react'
import { cn } from '@/utils/cn'
import styles from './pending-main.module.css'
import { RouteLoadingView } from './route-loading-view'
import { usePendingLoading } from './use-pending-navigation'

/**
 * The original switched views the moment a link was clicked and drew that view's loader while its data was
 * out. Here the new page is rendered on the server, so between the click and its arrival this stands in for
 * `<MainView>` (which it must be placed right before) with the same loader, scrolled to the top.
 */
export const PendingMain = ({ isLoggedIn, assetOrigin }: { isLoggedIn: boolean; assetOrigin: string }) => {
  const pending = usePendingLoading()
  const isShown = !!pending
  useEffect(() => {
    if (isShown) window.scrollTo(0, 0)
  }, [isShown])
  if (!pending) return null
  return (
    <main className={cn('MainView bg-white', styles.pending)} aria-busy="true">
      <RouteLoadingView loading={pending.loading} isLoggedIn={isLoggedIn} assetOrigin={assetOrigin} />
    </main>
  )
}
