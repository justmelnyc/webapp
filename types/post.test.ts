import { gqlComment, gqlPost, imageRegion, textRegion } from '@/test/fixtures/posts'
import { commentSchema, pageInfoSchema, postSchema, regionSchema } from './post'

describe('regionSchema', () => {
  it('parses text and image regions', () => {
    expect(regionSchema.parse(textRegion()).kind).toBe('text')
    const image = regionSchema.parse(imageRegion())
    expect(image.kind).toBe('image')
    if (image.kind === 'image') expect(image.links?.assets).toBe('p1-a1')
  })

  it('parses embed regions with arbitrary data', () => {
    expect(regionSchema.safeParse({ kind: 'embed', data: { service: 'youtube', id: 'x' } }).success).toBe(true)
  })

  it('discriminates on kind', () => {
    expect(regionSchema.safeParse({ kind: 'video', data: 'x' }).success).toBe(false)
    expect(regionSchema.safeParse({ data: 'x' }).success).toBe(false)
    // a text region must carry string data
    expect(regionSchema.safeParse({ kind: 'text', data: { url: 'x' } }).success).toBe(false)
    // an image region must carry an object
    expect(regionSchema.safeParse({ kind: 'image', data: 'x' }).success).toBe(false)
  })

  it('keeps unknown keys on image data (passthrough)', () => {
    const parsed = regionSchema.parse({ kind: 'image', data: { url: 'u', alt: 'a', extra: 1 } })
    expect(parsed.kind === 'image' && parsed.data).toMatchObject({ extra: 1 })
  })

  it('accepts image regions without a url', () => {
    expect(regionSchema.safeParse({ kind: 'image', data: { url: null } }).success).toBe(true)
  })
})

describe('postSchema', () => {
  it('parses a mock gqlPost fixture', () => {
    const post = postSchema.parse(gqlPost())
    expect(post.token).toBe('tokp1')
    expect(post.summary).toHaveLength(2)
    expect(post.assets[0]?.attachment.optimized?.metadata?.width).toBe(1200)
    expect(post.author.username).toBe('ada')
    expect(post.postStats.lovesCount).toBe(2)
  })

  it('strips unknown top-level keys', () => {
    const post = postSchema.parse(gqlPost())
    expect(post.author).not.toHaveProperty('settings')
  })

  it('tolerates authors with missing avatar sizes or null name', () => {
    const author = { id: 'u9', username: 'x', name: null, avatar: { regular: { url: 'u' } } }
    const post = postSchema.parse(gqlPost('p2', { author }))
    expect(post.author.avatar?.small).toBeUndefined()
    expect(post.author.name).toBeNull()
  })

  it('tolerates a null avatar', () => {
    expect(postSchema.safeParse(gqlPost('p3', { author: { id: 'u', username: 'x', avatar: null } })).success).toBe(true)
  })

  it('rejects a post with a bad region kind', () => {
    const result = postSchema.safeParse(gqlPost('p4', { content: [{ kind: 'nope', data: '' }] }))
    expect(result.success).toBe(false)
  })

  it.each(['author', 'postStats', 'currentUserState', 'token', 'assets'])('rejects a post missing %s', (key) => {
    const rest: Record<string, unknown> = { ...gqlPost() }
    delete rest[key]
    expect(postSchema.safeParse(rest).success).toBe(false)
  })

  it('rejects non-numeric stats', () => {
    const post = gqlPost('p5', { postStats: { lovesCount: '2', commentsCount: 0, viewsCount: 0, repostsCount: 0 } })
    expect(postSchema.safeParse(post).success).toBe(false)
  })
})

describe('commentSchema', () => {
  it('parses a mock gqlComment fixture', () => {
    const comment = commentSchema.parse(gqlComment())
    expect(comment.parentPost?.id).toBe('p1')
    expect(comment.author.username).toBe('grace')
  })

  it('rejects comments without content', () => {
    const { content: _content, ...rest } = gqlComment()
    void _content
    expect(commentSchema.safeParse(rest).success).toBe(false)
  })
})

describe('pageInfoSchema', () => {
  it('accepts a null cursor', () => {
    expect(pageInfoSchema.safeParse({ next: null, isLastPage: true }).success).toBe(true)
  })

  it('rejects a missing isLastPage', () => {
    expect(pageInfoSchema.safeParse({ next: 'abc' }).success).toBe(false)
  })
})
