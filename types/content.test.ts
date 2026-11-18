import { category, editorial, pageHeader } from '@/test/fixtures/content'
import { categorySchema, editorialSchema, pageHeaderSchema } from './content'

describe('content schemas', () => {
  it('parses a mock category', () => {
    const parsed = categorySchema.parse(category())
    expect(parsed.slug).toBe('art')
    expect(parsed.tileImage?.large?.metadata?.width).toBe(640)
  })

  it('accepts a category without a tile image', () => {
    expect(categorySchema.safeParse({ ...category(), tileImage: null }).success).toBe(true)
  })

  it('rejects a category without a slug', () => {
    const { slug: _slug, ...rest } = category()
    void _slug
    expect(categorySchema.safeParse(rest).success).toBe(false)
  })

  it('parses a mock page header with cta and author', () => {
    const parsed = pageHeaderSchema.parse(pageHeader())
    expect(parsed.ctaLink?.url).toBe('/join')
    expect(parsed.user?.username).toBe('ada')
  })

  it('accepts a page header with null image and user', () => {
    expect(pageHeaderSchema.safeParse({ ...pageHeader(), image: null, user: null, ctaLink: null }).success).toBe(true)
  })

  it('parses a mock editorial including its nested post', () => {
    const parsed = editorialSchema.parse(editorial())
    expect(parsed.path).toBe('/ada/post/tokp1')
    expect(parsed.post?.id).toBe('p1')
    expect(parsed.twoByOneImage?.original?.metadata?.height).toBe(400)
  })

  it('accepts an editorial without a post', () => {
    expect(editorialSchema.safeParse({ ...editorial(), post: null }).success).toBe(true)
  })

  it('rejects an editorial with a malformed nested post', () => {
    expect(editorialSchema.safeParse({ ...editorial(), post: { id: 'x' } }).success).toBe(false)
  })
})
