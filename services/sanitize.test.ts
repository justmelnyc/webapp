import { gqlComment, gqlPost, imageRegion, textRegion } from '@/test/fixtures/posts'
import { commentSchema, postSchema } from '@/types/post'
import { sanitizeComment, sanitizePost } from './sanitize'

const dirty = '<p onclick="x()">Hi</p><script>alert(1)</script><a href="javascript:x()">l</a>'

describe('sanitizePost', () => {
  it('cleans text regions in summary and content', () => {
    const post = postSchema.parse(gqlPost('p1', { summary: [textRegion(dirty)], content: [textRegion(dirty)] }))
    const out = sanitizePost(post)
    for (const region of [out.summary[0], out.content[0]]) {
      const data = region?.kind === 'text' ? region.data : ''
      expect(data).toContain('<p>Hi</p>')
      expect(data).not.toMatch(/script|onclick|javascript:/)
    }
  })

  it('cleans the summary of the original a repost points at', () => {
    const post = postSchema.parse(
      gqlPost('p1', { repostedSource: { id: 'o', token: 'o', author: gqlPost('o').author, summary: [textRegion(dirty)], assets: [] } }),
    )
    const data = sanitizePost(post).repostedSource?.summary?.[0]
    expect(data?.kind === 'text' ? data.data : '').not.toMatch(/script|onclick|javascript:/)
  })

  it('leaves image regions untouched', () => {
    const post = postSchema.parse(gqlPost('p1', { summary: [imageRegion()], content: [imageRegion()] }))
    expect(sanitizePost(post).summary).toEqual(post.summary)
  })

  it('does not mutate the input and preserves other fields', () => {
    const post = postSchema.parse(gqlPost('p1', { content: [textRegion(dirty)] }))
    const out = sanitizePost(post)
    expect(post.content[0]).toMatchObject({ data: dirty })
    expect(out.id).toBe(post.id)
    expect(out.assets).toBe(post.assets)
    expect(out.author).toBe(post.author)
  })
})

describe('sanitizeComment', () => {
  it('cleans text regions', () => {
    const comment = commentSchema.parse({ ...gqlComment(), content: [textRegion('<p>ok</p><script>x</script>')] })
    const region = sanitizeComment(comment).content[0]
    expect(region?.kind === 'text' && region.data).toBe('<p>ok</p>')
  })
})
