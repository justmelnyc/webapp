import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useCategoryDrawerStore } from '@/stores/category-drawer-store'
import type { PageHeader } from '@/types/content'
import { CategoryDrawerProvider } from './category-drawer'
import { CategoryHero } from './category-hero'
import { CategorySubscriptionsProvider } from './category-subscriptions'
import { DiscoverMain } from './discover-main'

jest.mock('@/actions/category-actions', () => ({ subscribeToCategories: jest.fn() }))
jest.mock('@/components/auth/registration-dialog', () => ({
  useRegistrationDialog: () => ({ open: jest.fn() }),
}))

const header: PageHeader = {
  id: 'ph',
  kind: 'CATEGORY',
  header: 'Art',
  user: { id: '1', username: 'ada' },
}

const setup = (subscribedIds: string[] = []) =>
  render(
    <CategorySubscriptionsProvider isLoggedIn subscribedIds={subscribedIds}>
      <CategoryDrawerProvider isCloseable>
        <CategoryHero header={header} categoryId="1" isPromo={false} />
        <DiscoverMain>
          <p>posts</p>
        </DiscoverMain>
      </CategoryDrawerProvider>
    </CategorySubscriptionsProvider>,
  )

beforeEach(() => useCategoryDrawerStore.setState({ isOpen: false }))

describe('CategoryHero', () => {
  it('shows only the avatar as credit and no subscribe button while the panel is closed', () => {
    setup()
    expect(screen.queryByText('Posted by')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Subscribe' })).not.toBeInTheDocument()
    expect(screen.getByText('posts').parentElement).toHaveClass('Discover', { exact: false })
    expect(screen.getByText('posts').parentElement?.className).not.toMatch(/drawerOpen/)
  })

  it('opens the panel from the round button of the phone-sized hero', async () => {
    setup()
    await userEvent.click(screen.getByTitle('Close Art info'))
    expect(useCategoryDrawerStore.getState().isOpen).toBe(true)
    // desktop and phone-sized hero both credit the photographer in full now
    expect(screen.getAllByText('Posted by')).toHaveLength(2)
    expect(screen.getAllByText('@ada')).toHaveLength(2)
    expect(screen.getByRole('button', { name: 'Subscribe' })).toBeInTheDocument()
    expect(screen.getByText('posts').parentElement?.className).toMatch(/drawerOpen/)
    await userEvent.click(screen.getByTitle('Close Art info'))
    expect(useCategoryDrawerStore.getState().isOpen).toBe(false)
  })

  it('marks the heading of a subscribed category', () => {
    setup(['1'])
    screen
      .getAllByRole('heading', { name: 'Art' })
      .forEach((heading) => expect(heading).toHaveClass('subscribed'))
  })

  it('marks the heading of other categories as unsubscribed', () => {
    setup(['2'])
    screen
      .getAllByRole('heading', { name: 'Art' })
      .forEach((heading) => expect(heading).toHaveClass('unsubscribed'))
  })
})
