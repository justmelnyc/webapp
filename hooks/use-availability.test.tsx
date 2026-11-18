import { act, renderHook } from '@testing-library/react'
import { checkAvailability } from '@/actions/account-actions'
import { AVAILABILITY_DELAY, useAvailability } from '@/hooks/use-availability'
import { usernameClientError, usernameFromServer } from '@/utils/availability'

jest.mock('@/actions/account-actions', () => ({ checkAvailability: jest.fn() }))
const mockCheck = jest.mocked(checkAvailability)

const setup = () =>
  renderHook(() =>
    useAvailability({ field: 'username', current: 'ada', clientError: usernameClientError, fromServer: usernameFromServer }),
  )

beforeEach(() => {
  jest.useFakeTimers()
  mockCheck.mockReset()
})
afterEach(() => jest.useRealTimers())

describe('useAvailability', () => {
  it('stays quiet for the saved value and fails fast on client errors', () => {
    const { result } = setup()
    act(() => result.current.check('ada'))
    expect(result.current.state.status).toBe('indeterminate')
    act(() => result.current.check('a b'))
    expect(result.current.state.status).toBe('failure')
    expect(mockCheck).not.toHaveBeenCalled()
  })

  it('shows "checking..." then asks the server once, after the debounce', async () => {
    mockCheck.mockResolvedValue({ ok: true, data: { username: false, suggestions: { username: ['bob1'] } } })
    const { result } = setup()
    act(() => result.current.check('bob'))
    act(() => result.current.check('bobb'))
    expect(result.current.state).toMatchObject({ status: 'request', message: 'checking...' })
    await act(async () => {
      await jest.advanceTimersByTimeAsync(AVAILABILITY_DELAY)
    })
    expect(mockCheck).toHaveBeenCalledTimes(1)
    expect(mockCheck).toHaveBeenCalledWith({ username: 'bobb' })
    expect(result.current.state).toMatchObject({ status: 'failure', suggestions: ['bob1'] })
  })

  it('drops an answer for a value that is no longer current', async () => {
    let resolve: (value: Awaited<ReturnType<typeof checkAvailability>>) => void = () => undefined
    mockCheck.mockReturnValue(new Promise((r) => (resolve = r)))
    const { result } = setup()
    act(() => result.current.check('bob'))
    await act(async () => {
      await jest.advanceTimersByTimeAsync(AVAILABILITY_DELAY)
    })
    act(() => result.current.check('ada'))
    await act(async () => resolve({ ok: true, data: { username: true, suggestions: {} } }))
    expect(result.current.state.status).toBe('indeterminate')
  })
})
