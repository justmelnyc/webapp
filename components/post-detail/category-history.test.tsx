import { render, screen } from '@testing-library/react'
import { gqlPost, textRegion } from '@/test/fixtures/posts'
import { postSchema } from '@/types/post'
import { CategoryHistory } from './category-history'

const withCategories = (categoryPosts: unknown[]) =>
  postSchema.parse(gqlPost('p1', { content: [textRegion('hi')], categoryPosts }))

describe('CategoryHistory', () => {
  it('says "Featured by @ello." for a featured post when no curator is named', () => {
    const post = withCategories([
      { id: '1-p1', status: 'featured', category: { id: '1', slug: 'art', name: 'Art' } },
    ])
    render(<CategoryHistory post={post} />)
    expect(screen.getByRole('link', { name: '@ello' })).toHaveAttribute('href', '/ello')
  })

  it('names the category when the curator is also who submitted it', () => {
    const post = withCategories([
      {
        id: '1-p1',
        status: 'featured',
        featuredBy: { username: 'sam' },
        submittedBy: { username: 'sam' },
        category: { id: '1', slug: 'art', name: 'Art' },
      },
    ])
    render(<CategoryHistory post={post} />)
    expect(screen.getByRole('link', { name: 'Art' })).toHaveAttribute('href', '/discover/art')
  })

  it('draws nothing for removed or missing category posts', () => {
    const { container } = render(
      <CategoryHistory post={withCategories([{ id: '1-p1', status: 'removed' }])} />,
    )
    expect(container.querySelector('p')).toBeNull()
    expect(container.querySelector('aside.CategoryHistory')).not.toBeNull()
  })
})
