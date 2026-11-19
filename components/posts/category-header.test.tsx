import { render as baseRender, screen } from '@testing-library/react'
import type { ReactElement } from 'react'
import { RegistrationDialogProvider } from '@/components/auth/registration-dialog'
import { gqlPost } from '@/test/fixtures/posts'
import { postSchema } from '@/types/post'
import { CategoryHeader, categoryOf } from './category-header'

jest.mock('@/actions/relationship-actions', () => ({ setFollowing: jest.fn() }))

const withCategory = postSchema.parse(
  gqlPost('p1', {
    createdAt: new Date(Date.now() - 5 * 60_000).toISOString(),
    categoryPosts: [{ id: '3-p1', status: 'featured', category: { id: '3', slug: 'fashion', name: 'Fashion' } }],
  }),
)
const without = postSchema.parse(gqlPost('p2'))

const render = (ui: ReactElement) =>
  baseRender(<RegistrationDialogProvider header={null}>{ui}</RegistrationDialogProvider>)

describe('CategoryHeader', () => {
  it('names the author and the first category, and links to the post', () => {
    render(<CategoryHeader post={withCategory} viewerId="u9" />)
    expect(screen.getByRole('link', { name: /@ada/ })).toHaveAttribute('href', '/ada')
    expect(screen.getByRole('link', { name: /in Fashion/ })).toHaveAttribute('href', '/discover/fashion')
    expect(screen.getByRole('link', { name: '5m' })).toHaveAttribute('href', '/ada/post/tokp1')
  })

  it('categoryOf is null for a post without categories, and the header renders nothing', () => {
    expect(categoryOf(without)).toBeNull()
    const { container } = render(<CategoryHeader post={without} />)
    expect(container.querySelector('header')).toBeNull()
  })
})
