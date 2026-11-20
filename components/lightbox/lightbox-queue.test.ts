import { gqlComment, gqlPost, imageRegion, textRegion } from '@/test/fixtures/posts'
import { commentSchema, postSchema, type Post } from '@/types/post'
import {
  assetIdOf,
  commentLightboxItem,
  lightboxPairs,
  paginationOf,
  postLightboxItem,
  queueItemIds,
  tempAssetId,
  type LightboxPair,
} from './lightbox-queue'

const post = (id: string, images: number, overrides: Record<string, unknown> = {}): Post =>
  postSchema.parse(
    gqlPost(id, {
      content: [textRegion(), ...Array.from({ length: images }, (_, i) => imageRegion(`${id}-a${i + 1}`))],
      ...overrides,
    }),
  )

const pair = (postId: string, n: number): LightboxPair => ({ postId, assetId: `${postId}-a${n}` })

describe('lightboxPairs', () => {
  it('lists every picture of every post in reading order, skipping text', () => {
    const pairs = lightboxPairs([post('p1', 2), post('p2', 0), post('p3', 1)].map(postLightboxItem))
    expect(pairs).toEqual([pair('p1', 1), pair('p1', 2), pair('p3', 1)])
  })

  it('puts the pictures a repost carries before its own, under the repost id', () => {
    const repost = post('r1', 1, { repostContent: [imageRegion('o1-a1'), imageRegion('o1-a2')] })
    expect(lightboxPairs([postLightboxItem(repost)])).toEqual([
      { postId: 'r1', assetId: 'o1-a1' },
      { postId: 'r1', assetId: 'o1-a2' },
      pair('r1', 1),
    ])
    expect(postLightboxItem(repost).isRepost).toBe(true)
  })

  it('uses the comment id for pictures in comments', () => {
    const comment = commentSchema.parse({ ...gqlComment('c9'), content: [imageRegion('c9-a1')] })
    expect(lightboxPairs([commentLightboxItem(comment)])).toEqual([{ postId: 'c9', assetId: 'c9-a1' }])
  })
})

describe('assetIdOf', () => {
  it('derives an id from an upload url when the region has no asset yet', () => {
    expect(tempAssetId('https://cdn.test/uploads/ello-ab-cd-ef.jpg')).toBe('ab_cd_ef')
    expect(tempAssetId('https://cdn.test/other/photo.jpg')).toBeNull()
    const fresh = { kind: 'image' as const, data: { url: 'https://cdn.test/uploads/ello-1-2.png' }, links: null }
    expect(assetIdOf(fresh)).toBe('1_2')
  })
})

describe('paginationOf', () => {
  const pairs = [pair('p1', 1), pair('p1', 2), pair('p2', 1)]

  it('gives both neighbours in the middle of the queue', () => {
    expect(paginationOf(pairs, pair('p1', 2))).toEqual({ prev: pair('p1', 1), next: pair('p2', 1) })
  })

  it('has no previous picture at the start and no next one at the end', () => {
    expect(paginationOf(pairs, pair('p1', 1))).toEqual({ prev: null, next: pair('p1', 2) })
    expect(paginationOf(pairs, pair('p2', 1))).toEqual({ prev: pair('p1', 2), next: null })
  })

  it('has no neighbours for nothing or for a picture that is not in the queue', () => {
    expect(paginationOf(pairs, null)).toEqual({ prev: null, next: null })
    expect(paginationOf(pairs, pair('zz', 1))).toEqual({ prev: null, next: null })
  })
})

describe('queueItemIds', () => {
  // twenty posts with one picture each
  const pairs = Array.from({ length: 20 }, (_, i) => pair(`p${i}`, 1))

  it('draws the posts of six pictures before and five after the selected one', () => {
    expect(queueItemIds(pairs, pair('p10', 1))).toEqual(['p4', 'p5', 'p6', 'p7', 'p8', 'p9', 'p10', 'p11', 'p12', 'p13', 'p14', 'p15'])
  })

  it('starts at the first post while fewer than six pictures come before', () => {
    expect(queueItemIds(pairs, pair('p0', 1))).toEqual(['p0', 'p1', 'p2', 'p3', 'p4', 'p5'])
    expect(queueItemIds(pairs, pair('p5', 1))[0]).toBe('p0')
    expect(queueItemIds(pairs, pair('p6', 1))[0]).toBe('p0')
    expect(queueItemIds(pairs, pair('p7', 1))[0]).toBe('p1')
  })

  it('names a post once however many of its pictures are in the window', () => {
    const multi = [pair('a', 1), pair('a', 2), pair('a', 3), pair('b', 1)]
    expect(queueItemIds(multi, pair('a', 2))).toEqual(['a', 'b'])
  })
})
