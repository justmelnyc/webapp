import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import type { DiscoverKind } from '@/components/discover/category-sub-nav'
import { DiscoverView } from '@/components/discover/discover-view'
import { getCategories } from '@/services/content'

interface Props {
  params: Promise<{ segments?: string[] }>
}

const KINDS: readonly DiscoverKind[] = ['featured', 'trending', 'recent', 'shop']
const isKind = (value: string | undefined): value is DiscoverKind => KINDS.includes(value as DiscoverKind)

interface Target {
  slug?: string
  kind: DiscoverKind
}

/** Original route: discover(/:stream)(/:kind), where a stream is a category slug or a global kind. */
const resolve = (segments: string[] = []): Target | null => {
  const [first, second, ...rest] = segments
  if (rest.length > 0) return null
  if (!first) return { kind: 'featured' }
  if (isKind(first)) return second ? null : { kind: first }
  if (!second) return { slug: first, kind: 'featured' }
  return isKind(second) ? { slug: first, kind: second } : null
}

const titleCase = (kind: DiscoverKind): string => kind.charAt(0).toUpperCase() + kind.slice(1)

export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
  const { segments } = await params
  const target = resolve(segments)
  if (!target) return { title: 'Discover' }
  if (!target.slug) return { title: target.kind === 'featured' ? 'Discover' : titleCase(target.kind) }
  const category = (await getCategories()).find((c) => c.slug === target.slug)
  return { title: category?.name ?? 'Discover' }
}

const DiscoverPage = async ({ params }: Props) => {
  const { segments } = await params
  const target = resolve(segments)
  if (!target) notFound()
  if (target.slug && !(await getCategories()).some((c) => c.slug === target.slug)) notFound()
  return <DiscoverView slug={target.slug} kind={target.kind} />
}

export default DiscoverPage
