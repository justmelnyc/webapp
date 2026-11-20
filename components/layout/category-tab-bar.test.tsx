import { render, screen } from '@testing-library/react'
import { CategoryTabBar, type CategoryTab } from './category-tab-bar'

let pathname = '/discover/art'
jest.mock('next/navigation', () => ({ usePathname: () => pathname }))

const ART: CategoryTab = { label: 'Art', slug: 'art', isPromo: false }
const ZERO_STATE = 'Find and subscribe to a category'

beforeEach(() => {
  pathname = '/discover/art'
})

describe('CategoryTabBar', () => {
  it('offers a signed-in viewer without subscriptions the zero state', () => {
    render(<CategoryTabBar tabs={[]} isLoggedIn />)
    expect(screen.getByRole('link', { name: 'Subscribed' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: ZERO_STATE })).toHaveAttribute('href', '/discover/all')
  })

  it('lists the subscribed categories instead once there are some', () => {
    render(<CategoryTabBar tabs={[ART]} isLoggedIn hasSubscriptions />)
    expect(screen.getByRole('link', { name: 'Art' })).toHaveClass('isActive')
    expect(screen.queryByRole('link', { name: ZERO_STATE })).not.toBeInTheDocument()
  })

  it('keeps the zero state next to promo tabs while nothing is subscribed', () => {
    render(<CategoryTabBar tabs={[{ ...ART, isPromo: true }]} isLoggedIn />)
    expect(screen.getByRole('link', { name: 'Art' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: ZERO_STATE })).toBeInTheDocument()
  })

  it('shows logged-out visitors neither Subscribed nor the zero state', () => {
    render(<CategoryTabBar tabs={[ART]} isLoggedIn={false} />)
    expect(screen.queryByRole('link', { name: 'Subscribed' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: ZERO_STATE })).not.toBeInTheDocument()
  })

  it('is hidden outside Discover and on the all-categories page', () => {
    pathname = '/discover/all'
    const { container } = render(<CategoryTabBar tabs={[ART]} isLoggedIn />)
    expect(container).toBeEmptyDOMElement()
  })
})
