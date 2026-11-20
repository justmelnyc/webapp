import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { subscribeToCategories } from '@/actions/category-actions'
import { CategorySubscribeButton } from './category-subscribe-button'
import { CategorySubscribedIcon } from './category-subscribed-icon'
import { CategorySubscriptionsProvider } from './category-subscriptions'

const openRegistration = jest.fn()
jest.mock('@/actions/category-actions', () => ({ subscribeToCategories: jest.fn() }))
jest.mock('@/components/auth/registration-dialog', () => ({
  useRegistrationDialog: () => ({ open: openRegistration }),
}))

const subscribeMock = jest.mocked(subscribeToCategories)

const setup = (isLoggedIn: boolean, subscribedIds: string[]) =>
  render(
    <CategorySubscriptionsProvider isLoggedIn={isLoggedIn} subscribedIds={subscribedIds}>
      <CategorySubscribedIcon categoryId="2" />
      <CategorySubscribeButton categoryId="2" />
    </CategorySubscriptionsProvider>,
  )

beforeEach(() => {
  jest.clearAllMocks()
  subscribeMock.mockResolvedValue({ ok: true, data: undefined })
})

describe('CategorySubscribeButton', () => {
  it('asks logged-out visitors to sign up', async () => {
    setup(false, [])
    await userEvent.click(screen.getByRole('button', { name: 'Subscribe' }))
    expect(openRegistration).toHaveBeenCalledWith('subscribe-from-page-header')
    expect(subscribeMock).not.toHaveBeenCalled()
  })

  it('subscribes by sending the whole list with the category added', async () => {
    setup(true, ['1'])
    const button = screen.getByRole('button', { name: 'Subscribe' })
    expect(button).not.toHaveClass('subscribed')
    expect(document.querySelector('.category-check')).toBeNull()
    await userEvent.click(button)
    await waitFor(() => expect(subscribeMock).toHaveBeenCalledWith(['1', '2']))
  })

  it('shows Subscribed with the check mark and unsubscribes', async () => {
    setup(true, ['1', '2'])
    const button = screen.getByRole('button', { name: 'Subscribed' })
    expect(button).toHaveClass('subscribed')
    expect(document.querySelector('.category-check')).not.toBeNull()
    await userEvent.click(button)
    await waitFor(() => expect(subscribeMock).toHaveBeenCalledWith(['1']))
  })

  it('never counts a logged-out visitor as subscribed', () => {
    setup(false, ['2'])
    expect(screen.getByRole('button', { name: 'Subscribe' })).toBeInTheDocument()
  })
})
