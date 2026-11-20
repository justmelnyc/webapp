import { isNavbarHiddenAfter, trackScroll, type ScrollTrack } from './use-navbar-hidden'

describe('trackScroll', () => {
  const start: ScrollTrack = { lastY: null, direction: null }

  it('takes a jump of 20px or more as a direction', () => {
    expect(trackScroll(start, 30)).toEqual({ lastY: 30, direction: 'down' })
    expect(trackScroll({ lastY: 500, direction: 'down' }, 470)).toEqual({ lastY: 470, direction: 'up' })
  })

  it('keeps the direction through small moves', () => {
    expect(trackScroll(start, 10)).toEqual({ lastY: 10, direction: null })
    expect(trackScroll({ lastY: 500, direction: 'down' }, 495)).toEqual({ lastY: 495, direction: 'down' })
  })
})

describe('isNavbarHiddenAfter', () => {
  const height = 900

  it('always shows the bars within the first screen', () => {
    expect(isNavbarHiddenAfter(true, 'down', 0, height)).toBe(false)
    expect(isNavbarHiddenAfter(false, 'down', 819, height)).toBe(false)
  })

  it('hides them scrolling down past it and shows them scrolling up', () => {
    expect(isNavbarHiddenAfter(false, 'down', 820, height)).toBe(true)
    expect(isNavbarHiddenAfter(true, 'down', 2000, height)).toBe(true)
    expect(isNavbarHiddenAfter(true, 'up', 2000, height)).toBe(false)
    expect(isNavbarHiddenAfter(false, 'up', 2000, height)).toBe(false)
    expect(isNavbarHiddenAfter(false, null, 2000, height)).toBe(false)
  })
})
