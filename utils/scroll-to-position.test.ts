import { bottomEdgeTarget, quarticInOut } from './scroll-to-position'

describe('scroll to position', () => {
  it('eases quartic in-out', () => {
    expect(quarticInOut(0)).toBe(0)
    expect(quarticInOut(0.5)).toBe(0.5)
    expect(quarticInOut(1)).toBe(1)
    expect(quarticInOut(0.25)).toBeCloseTo(0.03125)
  })

  it('aims the bottom edge of an element above the bottom of the viewport', () => {
    // jello.js: scrollY + (rect.bottom - innerHeight) + offset
    expect(bottomEdgeTarget(1500, 0, 900, 200)).toBe(800)
    expect(bottomEdgeTarget(700, 300, 900, 200)).toBe(300)
  })
})
