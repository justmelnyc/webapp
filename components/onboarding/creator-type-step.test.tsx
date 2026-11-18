import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { completeCreatorTypeStep } from '@/actions/onboarding-actions'
import { saveCreatorTypes } from '@/actions/profile-actions'
import { CreatorTypeStep } from './creator-type-step'

const push = jest.fn()

jest.mock('next/navigation', () => ({ useRouter: () => ({ push }) }))
jest.mock('@/actions/onboarding-actions', () => ({ completeCreatorTypeStep: jest.fn() }))
jest.mock('@/actions/profile-actions', () => ({ saveCreatorTypes: jest.fn() }))

const categories = [
  { id: 1, name: 'Art' },
  { id: 2, name: 'Design' },
]

describe('CreatorTypeStep', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(saveCreatorTypes).mockResolvedValue({ ok: true, data: undefined })
    jest.mocked(completeCreatorTypeStep).mockResolvedValue({ ok: true, data: undefined })
  })

  it('starts with neither choice picked and no categories', () => {
    render(<CreatorTypeStep categories={categories} selectedIds={[]} />)
    expect(screen.getByRole('button', { name: 'An Artist' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'A Fan' })).toBeEnabled()
    expect(screen.queryByText('I make:')).not.toBeInTheDocument()
  })

  it('opens with the artist choice when categories are already saved', () => {
    render(<CreatorTypeStep categories={categories} selectedIds={[2]} />)
    expect(screen.getByRole('button', { name: 'An Artist' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Design' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('shows the categories for an artist and saves them a second after the last click', async () => {
    jest.useFakeTimers()
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    render(<CreatorTypeStep categories={categories} selectedIds={[]} />)
    await user.click(screen.getByRole('button', { name: 'An Artist' }))
    await user.click(screen.getByRole('button', { name: 'Art' }))
    await user.click(screen.getByRole('button', { name: 'Design' }))
    expect(saveCreatorTypes).not.toHaveBeenCalled()
    await act(async () => {
      jest.advanceTimersByTime(1000)
    })
    expect(saveCreatorTypes).toHaveBeenCalledTimes(1)
    expect(saveCreatorTypes).toHaveBeenCalledWith([1, 2])
    jest.useRealTimers()
  })

  it('a fan has no categories', async () => {
    render(<CreatorTypeStep categories={categories} selectedIds={[1]} />)
    await userEvent.click(screen.getByRole('button', { name: 'A Fan' }))
    expect(screen.queryByText('I make:')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'A Fan' })).toBeDisabled()
  })

  it('marks onboarding started and continues to the categories', async () => {
    render(<CreatorTypeStep categories={categories} selectedIds={[]} />)
    await userEvent.click(screen.getByRole('button', { name: 'Create Account' }))
    await waitFor(() => expect(push).toHaveBeenCalledWith('/onboarding/categories'))
    expect(completeCreatorTypeStep).toHaveBeenCalled()
  })
})
