import { gqlComment, gqlPost } from '@/test/fixtures/posts'
import { commentPageSchema, postPageSchema, streamSpecSchema } from './stream'

describe('streamSpecSchema', () => {
  it.each([
    [{ type: 'global', kind: 'TRENDING' }],
    [{ type: 'following' }],
    [{ type: 'following', kind: 'TRENDING' }],
    [{ type: 'category', slug: 'art', kind: 'RECENT' }],
    [{ type: 'user', username: 'ada' }],
    [{ type: 'loves', username: 'ada' }],
    [{ type: 'search', terms: '#film' }],
  ])('accepts %j', (spec) => {
    expect(streamSpecSchema.parse(spec)).toEqual(spec)
  })

  it.each([
    [{ type: 'global' }],
    [{ type: 'global', kind: 'trending' }],
    [{ type: 'category', kind: 'RECENT' }],
    [{ type: 'following', kind: 'HOT' }],
    [{ type: 'user' }],
    [{ type: 'unknown' }],
    [{ kind: 'FEATURED' }],
    ['global'],
    [null],
  ])('rejects %j', (spec) => {
    expect(streamSpecSchema.safeParse(spec).success).toBe(false)
  })

  it('survives a JSON round trip (URL / query key transport)', () => {
    const spec = { type: 'category', slug: 'art', kind: 'SHOP' }
    expect(streamSpecSchema.parse(JSON.parse(JSON.stringify(spec)))).toEqual(spec)
  })
})

describe('page schemas', () => {
  it('parses a post page', () => {
    const page = postPageSchema.parse({ posts: [gqlPost('a'), gqlPost('b')], next: 'cur', isLastPage: false })
    expect(page.posts.map((p) => p.id)).toEqual(['a', 'b'])
  })

  it('parses an empty last page', () => {
    expect(postPageSchema.parse({ posts: [], next: null, isLastPage: true }).posts).toEqual([])
  })

  it('rejects a post page with an invalid post', () => {
    expect(postPageSchema.safeParse({ posts: [{ id: 'a' }], next: null, isLastPage: true }).success).toBe(false)
  })

  it('parses a comment page', () => {
    const page = commentPageSchema.parse({ comments: [gqlComment()], next: null, isLastPage: true })
    expect(page.comments).toHaveLength(1)
  })
})
