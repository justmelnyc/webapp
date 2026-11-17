import { render } from '@testing-library/react'
import { useInView } from './use-in-view'

interface FakeObserver {
  callback: IntersectionObserverCallback
  options?: IntersectionObserverInit
  observe: jest.Mock
  disconnect: jest.Mock
}

const observers: FakeObserver[] = []

const entry = (isIntersecting: boolean): IntersectionObserverEntry =>
  ({ isIntersecting }) as IntersectionObserverEntry

const Probe = ({ onEnter, rootMargin }: { onEnter: () => void; rootMargin?: string }) => {
  const ref = useInView(onEnter, rootMargin)
  return <div ref={ref} data-testid="sentinel" />
}

describe('useInView', () => {
  beforeEach(() => {
    observers.length = 0
    global.IntersectionObserver = jest.fn((callback, options) => {
      const observer: FakeObserver = { callback, options, observe: jest.fn(), disconnect: jest.fn() }
      observers.push(observer)
      return observer
    }) as unknown as typeof IntersectionObserver
  })

  it('observes the element with the default root margin', () => {
    const { getByTestId } = render(<Probe onEnter={jest.fn()} />)
    expect(observers).toHaveLength(1)
    expect(observers[0]?.observe).toHaveBeenCalledWith(getByTestId('sentinel'))
    expect(observers[0]?.options).toEqual({ rootMargin: '600px' })
  })

  it('accepts a custom root margin', () => {
    render(<Probe onEnter={jest.fn()} rootMargin="10px" />)
    expect(observers[0]?.options).toEqual({ rootMargin: '10px' })
  })

  it('calls onEnter only when an entry is intersecting', () => {
    const onEnter = jest.fn()
    render(<Probe onEnter={onEnter} />)
    const observer = observers[0]
    observer?.callback([entry(false)], {} as IntersectionObserver)
    expect(onEnter).not.toHaveBeenCalled()
    observer?.callback([entry(false), entry(true)], {} as IntersectionObserver)
    expect(onEnter).toHaveBeenCalledTimes(1)
  })

  it('re-subscribes with the new callback when onEnter changes', () => {
    const first = jest.fn()
    const second = jest.fn()
    const { rerender } = render(<Probe onEnter={first} />)
    rerender(<Probe onEnter={second} />)
    expect(observers).toHaveLength(2)
    expect(observers[0]?.disconnect).toHaveBeenCalled()
    observers[1]?.callback([entry(true)], {} as IntersectionObserver)
    expect(second).toHaveBeenCalledTimes(1)
    expect(first).not.toHaveBeenCalled()
  })

  it('disconnects on unmount', () => {
    const { unmount } = render(<Probe onEnter={jest.fn()} />)
    unmount()
    expect(observers[0]?.disconnect).toHaveBeenCalled()
  })
})
