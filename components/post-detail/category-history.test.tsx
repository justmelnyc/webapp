import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { runCategoryPostAction } from '@/actions/category-post-actions'
import { gqlPost, textRegion } from '@/test/fixtures/posts'
import { postSchema } from '@/types/post'
import { CategoryHistory } from './category-history'

jest.mock('@/actions/category-post-actions', () => ({ runCategoryPostAction: jest.fn() }))
jest.mock('@/stores/toast-store', () => ({ toast: { error: jest.fn() } }))

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

  describe('for a curator', () => {
    const category = { id: '1', slug: 'art', name: 'Art' }
    const feature = { method: 'PUT', href: '/api/v2/category_posts/1-p1/feature' }
    const unfeature = { method: 'PUT', href: '/api/v2/category_posts/1-p1/unfeature' }
    const run = jest.mocked(runCategoryPostAction)

    it('offers a grey feature button on a submitted post, and no badge-only span', () => {
      const post = withCategories([
        { id: '1-p1', status: 'submitted', submittedBy: { username: 'user-p1' }, actions: { feature, unfeature: null }, category },
      ])
      const { container } = render(<CategoryHistory post={post} />)
      const button = container.querySelector('button.featured-toggle')
      expect(button).not.toBeNull()
      expect(button).not.toHaveClass('featured')
      expect(button?.querySelector('path')).toHaveAttribute('fill', '#aaaaaa')
      expect(container.querySelector('span.featured-toggle')).toBeNull()
    })

    it('features the post and then shows who featured it, with an unfeature button', async () => {
      run.mockResolvedValue({
        ok: true,
        data: { id: '1-p1', status: 'featured', featuredByUsername: 'sam', submittedByUsername: 'sam', actions: { feature: null, unfeature } },
      })
      const post = withCategories([{ id: '1-p1', status: 'submitted', actions: { feature, unfeature: null }, category }])
      const { container } = render(<CategoryHistory post={post} />)
      fireEvent.click(container.querySelector('button.featured-toggle') as Element)
      expect(run).toHaveBeenCalledWith(feature)
      await waitFor(() => expect(screen.getByRole('link', { name: '@sam' })).toHaveAttribute('href', '/sam'))
      expect(container.querySelector('button.featured-toggle.featured')).not.toBeNull()
    })

    it('unfeatures a featured post and goes back to the grey button', async () => {
      run.mockResolvedValue({
        ok: true,
        data: { id: '1-p1', status: 'submitted', submittedByUsername: 'user-p1', actions: { feature, unfeature: null } },
      })
      const post = withCategories([{ id: '1-p1', status: 'featured', actions: { feature: null, unfeature }, category }])
      const { container } = render(<CategoryHistory post={post} />)
      fireEvent.click(container.querySelector('button.featured-toggle.featured') as Element)
      await waitFor(() => expect(container.querySelector('button.featured-toggle:not(.featured)')).not.toBeNull())
      expect(screen.queryByText(/Featured by/)).toBeNull()
    })

    it('keeps the record as it was when the action fails', async () => {
      run.mockResolvedValue({ ok: false, error: 'nope' })
      const post = withCategories([{ id: '1-p1', status: 'featured', actions: { feature: null, unfeature }, category }])
      const { container } = render(<CategoryHistory post={post} />)
      fireEvent.click(container.querySelector('button.featured-toggle') as Element)
      await waitFor(() => expect(run).toHaveBeenCalled())
      expect(container.querySelector('button.featured-toggle.featured')).not.toBeNull()
    })

    it('draws a submitted post with no actions as plain text without any badge', () => {
      const post = withCategories([{ id: '1-p1', status: 'submitted', submittedBy: { username: 'user-p1' }, category }])
      const { container } = render(<CategoryHistory post={post} />)
      expect(container.querySelector('.featured-toggle')).toBeNull()
    })
  })
})
