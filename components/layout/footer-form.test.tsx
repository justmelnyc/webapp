import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FooterForm, SUBSCRIBED_RESET_DELAY, subscriptionState } from './footer-form'

const checkAvailability = jest.fn()
jest.mock('@/actions/account-actions', () => ({ checkAvailability: (...args: unknown[]) => checkAvailability(...args) }))

beforeAll(() => {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  })) as unknown as typeof window.matchMedia
})

const free = { ok: true, data: { email: true, suggestions: { email: { full: null } } } }
const taken = { ok: true, data: { email: false, suggestions: { email: { full: null } } } }

describe('subscriptionState', () => {
  it('subscribes a free address and calls anything else invalid', () => {
    expect(subscriptionState(free.data)).toEqual({ status: 'success', message: 'Subscribed. See you tomorrow' })
    expect(subscriptionState(taken.data)).toEqual({ status: 'failure', message: 'That email is invalid' })
    expect(subscriptionState(null)).toEqual({ status: 'failure', message: 'That email is invalid' })
  })

  it('passes on the server’s suggestion', () => {
    expect(subscriptionState({ email: false, suggestions: { email: { full: 'ada@gmail.com' } } }).message).toBe('Did you mean ada@gmail.com?')
  })
})

describe('FooterForm', () => {
  beforeEach(() => checkAvailability.mockReset())
  afterEach(() => jest.useRealTimers())

  it('keeps the button locked until the text looks like an email', async () => {
    const { container } = render(<FooterForm />)
    const button = screen.getByRole('button', { name: 'Subscribe' })
    expect(button).toBeDisabled()
    expect(container.querySelector('form')).toHaveClass('isIndeterminate')
    await userEvent.type(screen.getByPlaceholderText('Enter email for daily inspiration'), 'nobody@')
    expect(button).toBeDisabled()
    await userEvent.type(screen.getByPlaceholderText('Enter email for daily inspiration'), 'example.com')
    expect(button).toBeEnabled()
  })

  it('says "That email is invalid" in red for a taken address, until the text changes', async () => {
    checkAvailability.mockResolvedValue(taken)
    const { container } = render(<FooterForm />)
    const input = screen.getByPlaceholderText('Enter email for daily inspiration')
    await userEvent.type(input, 'ada@example.com{Enter}')
    expect(checkAvailability).toHaveBeenCalledWith({ email: 'ada@example.com' })
    expect(await screen.findByText('That email is invalid')).toHaveClass('FormControlStatusBubble', 'inFooter')
    expect(container.querySelector('form')).toHaveClass('isFailing')
    await userEvent.type(input, 'x')
    expect(screen.queryByText('That email is invalid')).toBeNull()
    expect(container.querySelector('form')).toHaveClass('isIndeterminate')
  })

  it('says "Subscribed. See you tomorrow" in green, then empties the form', async () => {
    jest.useFakeTimers()
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    checkAvailability.mockResolvedValue(free)
    const { container } = render(<FooterForm />)
    const input = screen.getByPlaceholderText('Enter email for daily inspiration')
    await user.type(input, 'new@example.com')
    await user.click(screen.getByRole('button', { name: 'Subscribe' }))
    expect(await screen.findByText('Subscribed. See you tomorrow')).toBeInTheDocument()
    expect(container.querySelector('form')).toHaveClass('isSucceeding')
    expect(input).toHaveValue('new@example.com')
    act(() => {
      jest.advanceTimersByTime(SUBSCRIBED_RESET_DELAY)
    })
    expect(input).toHaveValue('')
    expect(screen.queryByText('Subscribed. See you tomorrow')).toBeNull()
    expect(screen.getByRole('button', { name: 'Subscribe' })).toBeDisabled()
  })
})
