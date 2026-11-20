import { renderHook } from '@testing-library/react'
import { useStreamCommentsStore } from '@/stores/stream-comments-store'
import { useSeeMoreScroll } from './use-see-more-scroll'

const frames: FrameRequestCallback[] = []
const flush = (now: number): void => frames.splice(0).forEach((frame) => frame(now))

describe('useSeeMoreScroll', () => {
  let scrollTo: jest.SpyInstance
  beforeEach(() => {
    frames.length = 0
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => frames.push(callback))
    jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => undefined)
    jest.spyOn(performance, 'now').mockReturnValue(0)
    scrollTo = jest.spyOn(window, 'scrollTo').mockImplementation(() => undefined)
    Object.defineProperty(window, 'innerHeight', { value: 900, configurable: true })
    document.body.innerHTML = '<section class="TabListStreamContainer"></section>'
    const comments = document.querySelector('.TabListStreamContainer') as HTMLElement
    comments.getBoundingClientRect = () => ({ bottom: 1500 }) as DOMRect
    useStreamCommentsStore.setState({ seeMore: null })
  })
  afterEach(() => jest.restoreAllMocks())

  it('eases the window down to the comments after "See More", once', () => {
    useStreamCommentsStore.getState().followSeeMore('p1')
    renderHook(() => useSeeMoreScroll('p1'))
    flush(0) // the frame the original waits before measuring
    flush(1000) // the last frame of the one second tween
    // jello.js: scrollY + (rect.bottom - innerHeight) + 200
    expect(scrollTo).toHaveBeenLastCalledWith(0, 800)
    expect(useStreamCommentsStore.getState().seeMore).toBeNull()
  })

  it('leaves a post page opened any other way at the top', () => {
    useStreamCommentsStore.getState().followSeeMore('another')
    renderHook(() => useSeeMoreScroll('p1'))
    flush(0)
    flush(1000)
    expect(scrollTo).not.toHaveBeenCalled()
  })
})
