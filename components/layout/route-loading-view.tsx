'use client'

import type { ReactNode } from 'react'
import { CategoryInfoTrigger } from '@/components/discover/category-info-trigger'
import triggerStyles from '@/components/discover/category-info-trigger.module.css'
import { CategorySubNav } from '@/components/discover/category-sub-nav'
import { DiscoverBeacon } from '@/components/discover/discover-beacon'
import { HeroFrame } from '@/components/discover/discover-hero'
import { AnnouncementBanner } from '@/components/notifications/announcement-banner'
import { NotificationPageList } from '@/components/notifications/notification-list'
import { NotificationTabLinks } from '@/components/notifications/notification-tabs'
import { SearchControl } from '@/components/profile/search-control'
import searchStyles from '@/components/profile/search-control.module.css'
import { FollowingBeacon } from '@/components/streams/following-beacon'
import { PageOffset } from './page-offset'
import type { RouteLoading } from './route-loading'
import { StreamBusy } from '@/components/streams/stream-busy'

export { StreamBusy }

/** The empty `.Hero` every view starts with: it keeps the page below the fixed navbar. */
const Offset = () => <PageOffset>{null}</PageOffset>

const View = ({ className, children }: { className: string; children: ReactNode }) => <div className={className}>{children}</div>

interface RouteLoadingViewProps {
  loading: RouteLoading
  isLoggedIn: boolean
  /** Where the API's static images (emoji in notifications) live. */
  assetOrigin: string
}

/** What a view shows from the moment it is opened until its first data is there (see route-loading.ts). */
export const RouteLoadingView = ({ loading, isLoggedIn, assetOrigin }: RouteLoadingViewProps) => {
  switch (loading.kind) {
    case 'editorial':
      return (
        <>
          <Offset />
          <StreamBusy />
        </>
      )
    case 'following':
      return (
        <View className="Following">
          <FollowingBeacon />
          <StreamBusy />
        </View>
      )
    case 'discover':
      return (
        <>
          <HeroFrame />
          {isLoggedIn && <DiscoverBeacon />}
          <View className="Discover relative">
            {/* a category's view starts with the closed info panel's trigger (`showInfo` in views/Discover.js) */}
            {loading.slug && loading.slug !== 'subscribed' && (
              <p className={triggerStyles.collapsed}>
                <CategoryInfoTrigger name={loading.slug} />
              </p>
            )}
            <CategorySubNav slug={loading.slug ?? undefined} kind={loading.section} />
            <StreamBusy />
          </View>
        </>
      )
    case 'invites':
      return (
        <View className="ArtistInvites">
          <Offset />
          <StreamBusy />
        </View>
      )
    case 'notifications':
      return (
        <>
          <Offset />
          <View className="Notifications">
            <NotificationTabLinks active={loading.tab} />
            <AnnouncementBanner />
            {/* the feed the app loaded when it started shows at once, as it did from the original's store */}
            <NotificationPageList key={loading.tab} tab={loading.tab} assetOrigin={assetOrigin} />
          </View>
        </>
      )
    case 'search':
      return (
        <>
          <Offset />
          <View className={`Search ${searchStyles.view}`}>
            <SearchControl query="" type="posts" />
          </View>
        </>
      )
  }
}
