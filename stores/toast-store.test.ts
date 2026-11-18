import { act } from '@testing-library/react'
import { toast, useToastStore } from './toast-store'

const messages = (): string[] => useToastStore.getState().toasts.map((t) => t.message)

describe('toast store', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    useToastStore.setState({ toasts: [] })
  })
  afterEach(() => {
    jest.useRealTimers()
  })

  it('pushes toasts with unique ids and kinds', () => {
    useToastStore.getState().push('success', 'a')
    useToastStore.getState().push('error', 'b')
    const [first, second] = useToastStore.getState().toasts
    expect(first).toMatchObject({ kind: 'success', message: 'a' })
    expect(second).toMatchObject({ kind: 'error', message: 'b' })
    expect(first?.id).not.toBe(second?.id)
  })

  it('dismisses a single toast by id', () => {
    toast.info('one')
    toast.info('two')
    const id = useToastStore.getState().toasts[0]?.id ?? -1
    useToastStore.getState().dismiss(id)
    expect(messages()).toEqual(['two'])
  })

  it('ignores dismissing an unknown id', () => {
    toast.info('one')
    useToastStore.getState().dismiss(99_999)
    expect(messages()).toEqual(['one'])
  })

  it('auto-expires after 5 seconds', () => {
    toast.success('bye')
    act(() => void jest.advanceTimersByTime(4999))
    expect(messages()).toEqual(['bye'])
    act(() => void jest.advanceTimersByTime(1))
    expect(messages()).toEqual([])
  })

  it('expires toasts independently', () => {
    toast.info('first')
    act(() => void jest.advanceTimersByTime(3000))
    toast.info('second')
    act(() => void jest.advanceTimersByTime(2000))
    expect(messages()).toEqual(['second'])
  })

  it('helpers map to kinds', () => {
    toast.error('e')
    toast.success('s')
    toast.info('i')
    expect(useToastStore.getState().toasts.map((t) => t.kind)).toEqual(['error', 'success', 'info'])
  })
})
