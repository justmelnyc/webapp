import { paddedViewport, rescaleToViewport, scaleToViewport } from './image-scale'

describe('paddedViewport', () => {
  it('pads by 80 / 60 / 40 / 20 as the viewport narrows, four times sideways on phones', () => {
    expect(paddedViewport({ width: 1440, height: 900 })).toEqual({ width: 1200, height: 800 })
    expect(paddedViewport({ width: 1280, height: 900 })).toEqual({ width: 1100, height: 820 })
    expect(paddedViewport({ width: 800, height: 600 })).toEqual({ width: 680, height: 540 })
    expect(paddedViewport({ width: 375, height: 900 })).toEqual({ width: 295, height: 860 })
  })
})

describe('scaleToViewport', () => {
  const viewport = { width: 1280, height: 900 }

  it('fills the height with a picture that is taller than the room', () => {
    const square = { width: 1000, height: 1000 }
    expect(scaleToViewport(square, square, viewport)).toEqual({ width: 820, height: 820 })
  })

  it('fills the width with a picture that is wider than the room', () => {
    // 1200x800 behind a 1500w candidate measures 1024x683 on a 1280 viewport
    const measured = { width: 1024, height: 683 }
    const scaled = scaleToViewport(measured, measured, viewport)
    expect(scaled.width).toBe(1100)
    expect(scaled.height).toBeCloseTo(733.69, 2)
  })

  it('enlarges small pictures too', () => {
    const small = { width: 100, height: 50 }
    expect(scaleToViewport(small, small, viewport)).toEqual({ width: 1100, height: 550 })
  })
})

describe('rescaleToViewport', () => {
  it('rescales from the whole-pixel size on screen, like the original after a resize', () => {
    const scaled = rescaleToViewport({ width: 1100, height: 733.69 }, { width: 375, height: 900 })
    expect(scaled.width).toBeCloseTo(295, 5)
    expect(scaled.height).toBeCloseTo((734 * 295) / 1100, 5)
  })
})
