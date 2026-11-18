import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { followCategories } from '@/actions/onboarding-actions'
import { useToastStore } from '@/stores/toast-store'
import { CategoriesStep } from './categories-step'

const push = jest.fn()

jest.mock('next/navigation', () => ({ useRouter: () => ({ push }) }))
jest.mock('@/actions/onboarding-actions', () => ({ followCategories: jest.fn() }))

const followMock = jest.mocked(followCategories)
const categories = [
  { id: '1', name: 'Art', slug: 'art', imageUrl: 'http://x/art.jpg' },
  { id: '2', name: 'Design', slug: 'design', imageUrl: null },
]
const next = () => screen.getByRole('button', { name: /Pick 1|Create Your Profile/ })

describe('CategoriesStep', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useToastStore.setState({ toasts: [] })
  })

  it('asks for one category and keeps next disabled until it is picked', async () => {
    render(<CategoriesStep categories={categories} />)
    expect(next()).toHaveTextContent('Pick 1')
    expect(next()).toBeDisabled()
    await userEvent.click(screen.getByRole('button', { name: 'Art' }))
    expect(screen.getByRole('button', { name: 'Art' })).toHaveAttribute('aria-pressed', 'true')
    expect(next()).toHaveTextContent('Create Your Profile')
    expect(next()).toBeEnabled()
  })

  it('counts back up when the pick is undone', async () => {
    render(<CategoriesStep categories={categories} />)
    await userEvent.click(screen.getByRole('button', { name: 'Art' }))
    await userEvent.click(screen.getByRole('button', { name: 'Art' }))
    expect(next()).toHaveTextContent('Pick 1')
  })

  it('follows the picked categories, then moves on to the profile step', async () => {
    followMock.mockResolvedValue({ ok: true, data: undefined })
    render(<CategoriesStep categories={categories} />)
    await userEvent.click(screen.getByRole('button', { name: 'Design' }))
    await userEvent.click(screen.getByRole('button', { name: 'Art' }))
    await userEvent.click(next())
    await waitFor(() => expect(push).toHaveBeenCalledWith('/onboarding/settings'))
    expect(followMock).toHaveBeenCalledWith([2, 1])
  })

  it('stays put and toasts when following fails', async () => {
    followMock.mockResolvedValue({ ok: false, error: 'Could not reach the API' })
    render(<CategoriesStep categories={categories} />)
    await userEvent.click(screen.getByRole('button', { name: 'Art' }))
    await userEvent.click(next())
    await waitFor(() => expect(useToastStore.getState().toasts[0]?.message).toBe('Could not reach the API'))
    expect(push).not.toHaveBeenCalled()
  })
})
