import { act, renderHook } from '@testing-library/react'
import { useDebouncedCallback } from './use-debounced-callback'

describe('useDebouncedCallback', () => {
  beforeEach(() => jest.useFakeTimers())
  afterEach(() => jest.useRealTimers())

  it('runs once, with the last arguments, after the delay', () => {
    const callback = jest.fn()
    const { result } = renderHook(() => useDebouncedCallback(callback, 300))
    act(() => {
      result.current('a')
      jest.advanceTimersByTime(200)
      result.current('b')
      jest.advanceTimersByTime(299)
    })
    expect(callback).not.toHaveBeenCalled()
    act(() => jest.advanceTimersByTime(1))
    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith('b')
  })

  it('drops a pending call on unmount', () => {
    const callback = jest.fn()
    const { result, unmount } = renderHook(() => useDebouncedCallback(callback, 300))
    act(() => result.current())
    unmount()
    act(() => jest.advanceTimersByTime(500))
    expect(callback).not.toHaveBeenCalled()
  })
})
