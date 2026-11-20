import type { Asset, Comment, ImageRegion, Post, Region } from '@/types/post'
import { isRepost } from '@/utils/repost'

/** One picture in the lightbox: the post (or comment) it belongs to and its asset. */
export interface LightboxPair {
  postId: string
  assetId: string
}

/** A post or comment as the lightbox draws it: its region lists in order and the assets behind them. */
export interface LightboxItem {
  id: string
  /** A repost's original content first, then what the poster wrote (the original's `repostContent` + `content`). */
  bodies: Region[][]
  assets: Asset[]
  /** The original keeps `isPostHeaderHidden` on everything but reposts. */
  isRepost: boolean
}

export type Direction = 'prev' | 'next'

/** How many pictures the queue keeps before and after the selected one (`assetsOffset`). */
const QUEUE_OFFSET = 6

/** The original's `getTempAssetId`: an id for a just-uploaded picture that has no asset yet. */
export const tempAssetId = (url: string): string | null => {
  if (!url.includes('uploads/')) return null
  return url
    .substring(url.lastIndexOf('/') + 1, url.lastIndexOf('.'))
    .replace('ello-', '')
    .replace(/-/g, '_')
}

/** The asset id an image region is known by, in the page and in the lightbox. */
export const assetIdOf = (region: ImageRegion): string | null =>
  region.links?.assets ?? (region.data.url ? tempAssetId(region.data.url) : null)

export const postLightboxItem = (post: Post): LightboxItem => ({
  id: post.id,
  bodies: isRepost(post) ? [post.repostContent ?? [], post.content] : [post.content],
  assets: post.assets,
  isRepost: isRepost(post),
})

export const commentLightboxItem = (comment: Comment): LightboxItem => ({
  id: comment.id,
  bodies: [comment.content],
  assets: comment.assets ?? [],
  isRepost: false,
})

/** Port of `selectPostsAssetIds`: every picture of every item, in reading order. */
export const lightboxPairs = (items: LightboxItem[]): LightboxPair[] =>
  items.flatMap((item) =>
    item.bodies.flat().flatMap((region) => {
      if (region.kind !== 'image') return []
      const assetId = assetIdOf(region)
      return assetId ? [{ postId: item.id, assetId }] : []
    }),
  )

export const samePair = (a: LightboxPair | null, b: LightboxPair | null): boolean =>
  !!a && !!b && a.postId === b.postId && a.assetId === b.assetId

const indexOfPair = (pairs: LightboxPair[], selected: LightboxPair): number =>
  pairs.findIndex((pair) => samePair(pair, selected))

export interface Pagination {
  prev: LightboxPair | null
  next: LightboxPair | null
}

/** Port of `getSetPagination`: the neighbours of the selected picture; none at either end. */
export const paginationOf = (pairs: LightboxPair[], selected: LightboxPair | null): Pagination => {
  const index = selected ? indexOfPair(pairs, selected) : -1
  if (index < 0) return { prev: null, next: null }
  return { prev: pairs[index - 1] ?? null, next: pairs[index + 1] ?? null }
}

/**
 * Port of `constructPostIdsArray`: the items drawn in the queue, a window of six pictures before the
 * selected one and five after it, as whole posts.
 */
export const queueItemIds = (pairs: LightboxPair[], selected: LightboxPair): string[] => {
  const index = indexOfPair(pairs, selected)
  const lower = index > QUEUE_OFFSET - 1 ? index - QUEUE_OFFSET : 0
  const windowed = pairs.slice(lower, index + QUEUE_OFFSET)
  return Array.from(new Set(windowed.map((pair) => pair.postId)))
}
