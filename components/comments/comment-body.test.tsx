import { render } from '@testing-library/react'
import { CommentBody } from '@/components/comments/comment-body'
import { responsive } from '@/test/fixtures/media'
import { gqlComment, imageRegion, textRegion } from '@/test/fixtures/posts'
import { commentSchema } from '@/types/post'

describe('CommentBody', () => {
  it('renders a text-only comment as one TextRegion', () => {
    const { container } = render(<CommentBody comment={commentSchema.parse(gqlComment())} />)
    expect(container.querySelectorAll('.CommentBody .TextRegion')).toHaveLength(1)
    expect(container.querySelector('.ImageRegion')).toBeNull()
  })

  it('renders image regions in order with their responsive sizes (the original ImageAttachment)', () => {
    const comment = commentSchema.parse({
      ...gqlComment(),
      content: [textRegion('<p>Look</p>'), imageRegion('c1-a1', 'http://s/a.png')],
      assets: [{ id: 'c1-a1', attachment: responsive('http://s/a.png', 300, 200) }],
    })
    const { container } = render(<CommentBody comment={comment} />)
    const regions = Array.from(container.querySelectorAll('.CommentBody > div > div')).map(
      (el) => el.classList[0],
    )
    expect(regions).toEqual(['TextRegion', 'ImageRegion'])
    const img = container.querySelector('img.ImageAttachment')
    expect(img).toHaveAttribute('src', 'http://s/a.png')
    expect(img?.getAttribute('srcset')).toContain('1500w')
  })

  it('accepts a comment with no assets list (notifications do not ask for it)', () => {
    const rest: Record<string, unknown> = { ...gqlComment() }
    delete rest.assets
    expect(commentSchema.parse(rest).assets).toBeUndefined()
  })
})
