import { ServerStream } from '@/components/streams/server-stream'
import { getSession } from '@/lib/session'
import { getCategoryDetails } from '@/services/categories'
import { getCategories, getPageHeader } from '@/services/content'
import { getViewer } from '@/services/viewer'
import type { StreamKind } from '@/types/stream'
import { canAssignRoles } from '@/utils/category-roles'
import { CategoryDrawerProvider } from './category-drawer'
import { CategoryHero } from './category-hero'
import { CategoryInfo } from './category-info'
import { CategorySubNav, type DiscoverKind } from './category-sub-nav'
import { CategorySubscriptionsProvider } from './category-subscriptions'
import { DiscoverBeacon } from './discover-beacon'
import { HeroFrame, PageHero } from './discover-hero'
import { DiscoverMain } from './discover-main'
import { ZeroSubscribedStream } from '@/components/streams/zero-subscribed-stream'

/** The `stream` the original treats as the viewer's subscribed categories instead of a category slug. */
export const SUBSCRIBED = 'subscribed'

interface DiscoverViewProps {
  /** Category slug (or `subscribed`); omitted for the global Featured / Trending / Recent / Shop streams. */
  slug?: string
  kind: DiscoverKind
}

const STREAM_KINDS = {
  featured: 'FEATURED',
  trending: 'TRENDING',
  recent: 'RECENT',
  shop: 'SHOP',
} as const satisfies Record<DiscoverKind, StreamKind>

/**
 * The global streams and the subscribed one (`stream` 'global' / 'subscribed' in the original's DiscoverContainer):
 * the generic hero, the sub navigation and the posts, without a category's info panel.
 */
const GlobalView = async ({ kind, isSubscribed = false }: { kind: DiscoverKind; isSubscribed?: boolean }) => {
  const [header, session] = await Promise.all([getPageHeader('GENERIC'), getSession()])
  const type = isSubscribed ? 'subscribed' : 'global'
  return (
    <>
      <HeroFrame>{header && <PageHero header={header} />}</HeroFrame>
      {session && <DiscoverBeacon />}
      <div className="Discover relative">
        <CategorySubNav slug={isSubscribed ? SUBSCRIBED : undefined} kind={kind} />
        <ServerStream
          key={`${type}-${kind}`}
          spec={{ type, kind: STREAM_KINDS[kind] }}
          emptyMessage={isSubscribed ? <ZeroSubscribedStream /> : undefined}
        />
      </div>
    </>
  )
}

/** A category: its hero, the info panel (closed until asked for), the sub navigation and the posts. */
const CategoryView = async ({ slug, kind }: { slug: string; kind: DiscoverKind }) => {
  const [header, categories, details, viewer] = await Promise.all([
    getPageHeader('CATEGORY', slug),
    getCategories(),
    getCategoryDetails(slug),
    getViewer(),
  ])
  const category = categories.find((c) => c.slug === slug)
  const roleViewer = { id: viewer?.id ?? null, canAssign: canAssignRoles(viewer, details.id) }
  return (
    <CategorySubscriptionsProvider
      isLoggedIn={!!viewer}
      subscribedIds={viewer?.followedCategoryIds ?? []}
    >
      <CategoryDrawerProvider isCloseable={!details.brandAccount}>
        <HeroFrame>
          {header && (
            <CategoryHero
              header={header}
              categoryId={details.id}
              isPromo={category?.level === 'promo'}
            />
          )}
        </HeroFrame>
        {viewer && <DiscoverBeacon />}
        <DiscoverMain>
          <CategoryInfo
            key={details.id}
            category={details}
            cta={header?.ctaLink}
            viewer={roleViewer}
          />
          <CategorySubNav slug={slug} kind={kind} />
          <ServerStream
            key={`${slug}-${kind}`}
            spec={{ type: 'category', slug, kind: STREAM_KINDS[kind] }}
          />
        </DiscoverMain>
      </CategoryDrawerProvider>
    </CategorySubscriptionsProvider>
  )
}

/** The original's Discover view: the hero, the sub navigation and the post stream. */
export const DiscoverView = ({ slug, kind }: DiscoverViewProps) => {
  if (slug === SUBSCRIBED) return <GlobalView kind={kind} isSubscribed />
  return slug ? <CategoryView slug={slug} kind={kind} /> : <GlobalView kind={kind} />
}
