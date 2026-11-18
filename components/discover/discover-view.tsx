import { ServerStream } from '@/components/streams/server-stream'
import { getSession } from '@/lib/session'
import { getCategories, getPageHeader } from '@/services/content'
import type { StreamKind } from '@/types/stream'
import { CategoryHero } from './category-hero'
import { CategoryInfoTrigger } from './category-info-trigger'
import { CategorySubNav, type DiscoverKind } from './category-sub-nav'
import { DiscoverBeacon } from './discover-beacon'
import { HeroFrame, PageHero } from './discover-hero'

interface DiscoverViewProps {
  /** Category slug; omitted for the global Featured / Trending / Recent / Shop streams. */
  slug?: string
  kind: DiscoverKind
}

const STREAM_KINDS = {
  featured: 'FEATURED',
  trending: 'TRENDING',
  recent: 'RECENT',
  shop: 'SHOP',
} as const satisfies Record<DiscoverKind, StreamKind>

/** The original's Discover view: the hero, the sub navigation and the post stream. */
export const DiscoverView = async ({ slug, kind }: DiscoverViewProps) => {
  const [header, categories, session] = await Promise.all([
    getPageHeader(slug ? 'CATEGORY' : 'GENERIC', slug),
    slug ? getCategories() : Promise.resolve([]),
    getSession(),
  ])
  const category = categories.find((c) => c.slug === slug)
  const streamKind = STREAM_KINDS[kind]
  const spec = slug ? ({ type: 'category', slug, kind: streamKind } as const) : ({ type: 'global', kind: streamKind } as const)
  return (
    <>
      <HeroFrame>
        {header && (slug ? <CategoryHero header={header} isPromo={category?.level === 'promo'} /> : <PageHero header={header} />)}
      </HeroFrame>
      {session && <DiscoverBeacon />}
      <div className="Discover relative">
        {category && <CategoryInfoTrigger name={category.name} />}
        <CategorySubNav slug={slug} kind={kind} />
        <ServerStream key={`${slug ?? 'global'}-${kind}`} spec={spec} />
      </div>
    </>
  )
}
